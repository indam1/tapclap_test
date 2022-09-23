import { res } from '@/resource';
import {
    N, M, K, S,
} from '../globalVariables';

const tileColors = {
    blue: res.Blue_png,
    green: res.Green_png,
    red: res.Red_png,
    purple: res.Purple_png,
    yellow: res.Yellow_png,
};

const {
    Layer, Sprite, eventManager, rect, EventListener, rectContainsPoint, winSize,
} = cc;
export default class gameLayer {
    algLee = {
        marked: [],
        current: [],
        start: null,
        parent: null,
        cleanUp() {
            this.marked = [];
            this.current = [];
            this.start = null;
        },
        canAdd(x, y) {
            const tag = `${x}${y}`;
            const tile = this.parent.getChildByTag(tag);
            return tile
                && !this.marked.includes(tag)
                && !this.current.includes(tag)
                && this.start.colorImg === tile.texture.url;
        },
        mark(x, y) {
            const tag = `${x}${y}`;
            this.current.push(tag);
        },
        execute(start) {
            if (!start) {
                return null;
            }
            this.start = start;
            this.current.push(this.start.tag);
            while (this.current.length) {
                this.current.forEach((currentItem) => {
                    const { x, y } = gameLayer.getCoordinatesFromTag(currentItem);
                    [
                        { x: x + 1, y },
                        { x: x - 1, y },
                        { x, y: y + 1 },
                        { x, y: y - 1 },
                    ].forEach((variant) => {
                        if (this.canAdd(variant.x, variant.y)) {
                            this.mark(variant.x, variant.y);
                        }
                    });
                    this.marked.push(currentItem);
                    this.current = this.current.filter((currentBufferItem) => currentBufferItem !== currentItem);
                });
            }
            const { marked } = this;
            this.cleanUp();
            return marked.length && marked.length >= K ? marked : null;
        },
    };

    constructor(scene) {
        const Instance = Layer.extend({
            ctor() {
                this._super();
                return true;
            },
        });

        this.scene = scene;
        this.instance = new Instance();
        this.init();
        scene.addChild(this.instance);
    }

    init() {
        this.instance.setName('game');
        this.algLee.parent = this.instance;
        for (let y = M - 1; y >= 0; y -= 1) {
            for (let x = 0; x < N; x += 1) {
                this.createTile(x, y);
            }
        }
        return true;
    }

    createTile(x, y, color = null) {
        const tileKeys = Object.keys(tileColors);
        const randomIndex = Math.floor(Math.random() * tileKeys.length);
        const colorImg = color ?? tileColors[tileKeys[randomIndex]];
        const sprite = new Sprite(colorImg);
        sprite.attr({
            x: gameLayer.xTilePosition(winSize.width, x),
            y: gameLayer.yTilePosition(winSize.height, y),
            scale: 0.3,
        });
        sprite.setLocalZOrder(100000 - y);
        this.instance.addChild(sprite);
        const tag = `${x}${y}`;
        sprite.setTag(tag);
        eventManager.addListener(this.tileTouchListener(tag, colorImg), sprite);
    }

    static xTilePosition = (width, index) => width / 4 + index * 51;

    static yTilePosition = (height, index) => height / 1.25 - index * 51;

    static getCoordinatesFromTag = (tag) => {
        const x = parseInt(tag[0], 10);
        const y = parseInt(tag[1], 10);
        return { x, y };
    };

    hasChain() {
        for (let y = M - 1; y >= 0; y -= 1) {
            for (let x = 0; x < N; x += 1) {
                const tag = `${x}${y}`;
                const colorImg = this.instance.getChildByTag(tag).texture.url;
                const tilesToDelete = this.algLee.execute({ tag, colorImg });
                if (tilesToDelete) {
                    return true;
                }
            }
        }
        return false;
    }

    moveDownTiles(deletedTilesList) {
        Object.keys(deletedTilesList).forEach((column) => {
            let columnArray = deletedTilesList[column];
            while (columnArray.length) {
                const sortedColumnArray = columnArray.sort((rowA, rowB) => rowB - rowA);
                const lowestEmptyRow = sortedColumnArray.shift(0);
                for (let upperRow = lowestEmptyRow - 1; upperRow >= 0; upperRow -= 1) {
                    const oldTag = `${column}${upperRow}`;
                    if (this.instance.getChildByTag(oldTag)) {
                        const newTag = `${column}${lowestEmptyRow}`;
                        this.moveTile(oldTag, newTag);
                        columnArray.push(upperRow);
                        break;
                    }
                }
                columnArray = sortedColumnArray;
            }
        });
    }

    fillTiles(deletedTilesList) {
        Object.keys(deletedTilesList).forEach((column) => {
            for (let i = 0; i <= deletedTilesList[column].length - 1; i += 1) {
                this.createTile(column, i);
            }
        });
    }

    moveTile(oldTag, newTag) {
        const oldPlace = this.instance.getChildByTag(oldTag);
        const newPlace = this.instance.getChildByTag(newTag);
        if (!oldPlace) {
            return;
        }
        if (newPlace) {
            return;
        }

        const color = oldPlace.texture.url;
        this.instance.removeChildByTag(oldTag, true);
        const { x, y } = gameLayer.getCoordinatesFromTag(newTag);
        this.createTile(x, y, color);
    }

    swapTiles(firstTag, secondTag) {
        const firstPlace = this.instance.getChildByTag(firstTag);
        if (!firstPlace) {
            return;
        }
        const secondPlace = this.instance.getChildByTag(secondTag);
        if (!secondPlace) {
            return;
        }

        const firstColor = firstPlace.texture.url;
        const secondColor = secondPlace.texture.url;
        this.instance.removeChildByTag(firstTag, true);
        this.instance.removeChildByTag(secondTag, true);
        const { x: firstX, y: firstY } = gameLayer.getCoordinatesFromTag(firstTag);
        this.createTile(firstX, firstY, secondColor);
        const { x: secondX, y: secondY } = gameLayer.getCoordinatesFromTag(secondTag);
        this.createTile(secondX, secondY, firstColor);
    }

    tileTouchListener(tag, colorImg) {
        const parent = this;
        const uiLayer = this.scene.getChildByName('ui');

        return {
            event: EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan(touch, event) {
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(touch.getLocation());
                const s = target.getContentSize();
                const myRect = rect(0, 0, s.width, s.height);
                if (!rectContainsPoint(myRect, locationInNode)) {
                    return false;
                }

                const tilesToDelete = parent.algLee.execute({ tag, colorImg });
                if (!tilesToDelete) {
                    return false;
                }

                const movesElem = uiLayer.getChildByName('moves');
                const pointsElem = uiLayer.getChildByName('points');
                const points = parseInt(pointsElem.getString(), 10);
                const progressElem = uiLayer.getChildByName('progress');

                movesElem.setString(parseInt(movesElem.getString(), 10) - 1);
                pointsElem.setString(points + tilesToDelete.length);
                progressElem.attr({
                    x: 200 + (progressElem.width * (points * 0.001)) / 2,
                    y: 600,
                    scaleY: 0.3,
                    scaleX: 0.3 + points * 0.001,
                });

                tilesToDelete.forEach((deletedTile) => {
                    parent.instance.removeChildByTag(deletedTile);
                });

                const deletedTilesList = tilesToDelete.reduce((result, coordinates) => {
                    const { x, y } = gameLayer.getCoordinatesFromTag(coordinates);
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
                    for (let i = 0; i < S; i += 1) {
                        const firstTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                        const secondTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                        if (firstTag !== secondTag) {
                            parent.swapTiles(firstTag, secondTag);
                        }
                    }
                    return false;
                }
                return true;
            },
        };
    }
}
