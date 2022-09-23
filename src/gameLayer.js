const N = 4;
const M = 4;
const K = 2;
const S = 1000;
const xAxes = {};
for (let x = 0; x < N; x++) {
    xAxes[x] = N;
}
const yAxes = {};
for (let y = 0; y < M; y++) {
    yAxes[y] = M;
}

export const GameLayer = cc.Layer.extend({
    sprite: null,
    algLee: {
        marked: [],
        current: [],
        start: null,
        parent: null,
        cleanUp() {
            this.marked = [];
            this.current = [];
            this.start = null;
        },
        canAdd: function(x, y) {
            const tag = `${x}${y}`;
            const tile = this.parent.getChildByTag(tag)
            return tile
                && !this.marked.includes(tag)
                && !this.current.includes(tag)
                && this.start.colorImg === tile.texture.url;
        },
        mark: function(x, y) {
            const tag = `${x}${y}`;
            this.current.push(tag);
        },
        execute: function(start) {
            if (!start) {
                return null;
            }
            this.start = start;
            this.current.push(this.start.tag);
            while (this.current.length) {
                this.current.forEach((currentItem) => {
                    const { x, y } = this.parent.getCoordinatesFromTag(currentItem);
                    [
                        { x: x + 1, y },
                        { x: x - 1, y },
                        { x: x, y: y + 1},
                        { x: x, y: y - 1},
                    ].forEach((variant) => {
                        if (this.canAdd(variant.x, variant.y)) {
                            this.mark(variant.x, variant.y);
                        }
                    })
                    this.marked.push(currentItem);
                    this.current = this.current.filter((currentBufferItem) => currentBufferItem !== currentItem);
                })
            }
            const marked = this.marked;
            this.cleanUp();
            return marked.length && marked.length >= K ? marked : null;
        }
    },
    size: cc.winSize,
    tileColors: {
        blue: res.Blue_png,
        green: res.Green_png,
        red: res.Red_png,
        purple: res.Purple_png,
        yellow: res.Yellow_png,
    },
    xTilePosition(width, index) {
        return width / 4 + index * 51;
    },
    yTilePosition(height, index) {
        return height / 1.25 - index * 51;
    },
    hasChain: function() {
        for (let y = M - 1; y >= 0; y--) {
            for (let x = 0; x < N; x++) {
                const tag = `${x}${y}`;
                const colorImg = this.getChildByTag(tag).texture.url;
                const tilesToDelete = this.algLee.execute({ tag, colorImg });
                if (tilesToDelete) {
                    return true;
                }
            }
        }
        return false;
    },
    getCoordinatesFromTag: function(tag) {
        const x = parseInt(tag[0], 10);
        const y = parseInt(tag[1], 10);
        return { x, y };
    },
    createTile: function(x, y, color = null) {
        const tileKeys = Object.keys(this.tileColors);
        const randomIndex = Math.floor(Math.random() * tileKeys.length);
        const colorImg = color ?? this.tileColors[tileKeys[randomIndex]];
        const sprite = new cc.Sprite(colorImg);
        sprite.attr({
            x: this.xTilePosition(this.size.width, x),
            y: this.yTilePosition(this.size.height, y),
            scale: 0.3,
        });
        sprite.setLocalZOrder(100000 - y);
        this.addChild(sprite);
        const tag = `${x}${y}`;
        sprite.setTag(tag);
        cc.eventManager.addListener(this.tileTouchListener(tag, colorImg), sprite);
        return sprite;
    },
    moveDownTiles: function(deletedTilesList) {
        Object.keys(deletedTilesList).forEach(column => {
            let columnArray = deletedTilesList[column];
            while (columnArray.length) {
                const sortedColumnArray = columnArray.sort((rowA, rowB) => rowB - rowA);
                const lowestEmptyRow = sortedColumnArray.shift(0);
                for (let upperRow = lowestEmptyRow - 1; upperRow >= 0; upperRow--) {
                    const oldTag = `${column}${upperRow}`;
                    if (this.getChildByTag(oldTag)) {
                        const newTag = `${column}${lowestEmptyRow}`;
                        this.moveTile(oldTag, newTag);
                        columnArray.push(upperRow);
                        break;
                    }
                }
                columnArray = sortedColumnArray;
            }
        });
    },
    fillTiles: function(deletedTilesList) {
        Object.keys(deletedTilesList).forEach(column => {
            for (let i = 0; i <= deletedTilesList[column].length - 1; i++) {
                this.createTile(column, i);
            }
        })
    },
    moveTile: function (oldTag, newTag) {
        const oldPlace = this.getChildByTag(oldTag);
        const newPlace = this.getChildByTag(newTag);
        if (!oldPlace) {
            return;
        }
        if (newPlace) {
            return;
        }

        const color = oldPlace.texture.url;
        this.removeChildByTag(oldTag, true);
        const { x, y } = this.getCoordinatesFromTag(newTag);
        this.createTile(x, y, color);
    },
    swapTiles: function(firstTag, secondTag) {
        const firstPlace = this.getChildByTag(firstTag);
        if (!firstPlace) {
            return;
        }
        const secondPlace = this.getChildByTag(secondTag);
        if (!secondPlace) {
            return;
        }

        const firstColor = firstPlace.texture.url;
        const secondColor = secondPlace.texture.url;
        this.removeChildByTag(firstTag, true);
        this.removeChildByTag(secondTag, true);
        const { x: firstX, y: firstY } = this.getCoordinatesFromTag(firstTag);
        this.createTile(firstX, firstY, secondColor);
        const { x: secondX, y: secondY } = this.getCoordinatesFromTag(secondTag);
        this.createTile(secondX, secondY, firstColor);
    },
    tileTouchListener: function (tag, colorImg) {
        const parent = this;

        return {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(touch.getLocation());
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
                if (!cc.rectContainsPoint(rect, locationInNode)) {
                    return false;
                }

                const tilesToDelete = parent.algLee.execute({ tag, colorImg });
                if (!tilesToDelete) {
                    return false;
                }

                const movesElem = parent.getChildByName('moves');
                const pointsElem = parent.getChildByName('points');
                const points = parseInt(pointsElem.getString(), 10);
                const progressElem = parent.getChildByName('progress');

                movesElem.setString(parseInt(movesElem.getString(), 10) - 1);
                pointsElem.setString(points + tilesToDelete.length);
                progressElem.attr({
                    x: 200 + progressElem.width * (points * 0.001) / 2,
                    y: 600,
                    scaleY: 0.3,
                    scaleX: 0.3 + points * 0.001,
                })

                tilesToDelete.forEach((deletedTile) => {
                    parent.removeChildByTag(deletedTile);
                })

                const deletedTilesList = tilesToDelete.reduce((result, coordinates) => {
                    const { x, y } = parent.getCoordinatesFromTag(coordinates);
                    if (!result[x]) {
                        result[x] = [];
                    }
                    result[x].push(y);
                    return result;
                }, {});

                const newObj = JSON.parse(JSON.stringify(deletedTilesList));
                parent.moveDownTiles(deletedTilesList);
                parent.fillTiles(newObj);

                if (!parent.hasChain()) {
                    for (let i = 0; i < S; i++) {
                        const firstTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                        const secondTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                        if (firstTag === secondTag) {
                            continue;
                        }
                        parent.swapTiles(firstTag, secondTag);
                    }
                    return false;
                }
                return true;
            }
        }
    },
    ctor: function () {
        this._super();
        this.algLee.parent = this;
        this.uiLayer = this.get
        for (let y = M - 1; y >= 0; y--) {
            for (let x = 0; x < N; x++) {
                this.createTile(x, y);
            }
        }
        return true;
    }
});