import { res } from '@/resource';
import {
    N, M, K, S, UI, winPoints,
} from '../configs/globalVariables';
import BaseLayer from './BaseLayer';
import { LoseScene, WinScene } from '../scene';
import { sleepWhen } from '../helpers/AsyncHelper';

const tileColors = {
    blue: res.Blue_png,
    green: res.Green_png,
    red: res.Red_png,
    purple: res.Purple_png,
    yellow: res.Yellow_png,
};

const {
    Sprite, eventManager, rect, EventListener, rectContainsPoint, winSize, director, FadeIn, FadeOut,
} = cc;
export default class GameLayer extends BaseLayer {
    locked = false;

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
                    const { x, y } = GameLayer.getCoordinatesFromTag(currentItem);
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
        super(scene);
        this.init();
    }

    init() {
        this.instance.setName('game');
        this.algLee.parent = this.instance;
        const field = new Sprite(res.Field_png);
        field.attr({
            x: GameLayer.xTilePosition(winSize.width, 0),
            y: GameLayer.yTilePosition(winSize.height, 0),
            scale: UI.commonScale,
        });
        field.setAnchorPoint(0.03, 0.97);
        this.instance.addChild(field);
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
        const tile = new Sprite(colorImg);
        tile.attr({
            x: GameLayer.xTilePosition(winSize.width, x, tile.width),
            y: GameLayer.yTilePosition(winSize.height, y, tile.width),
            scale: UI.commonScale,
        });
        tile.setAnchorPoint(0, 1);
        tile.setLocalZOrder(100000 - y);
        this.instance.addChild(tile);
        if (!color) {
            tile.setOpacity(0);
        }
        tile.runAction(FadeIn.create(1));
        const tag = `${x}${y}`;
        tile.setTag(tag);
        eventManager.addListener(this.tileTouchListener(tag, colorImg), tile);
    }

    static xTilePosition = (width, index, tileWidth = 0) => width / 2 + tileWidth * UI.commonScale * index;

    static yTilePosition = (height, index, tileWidth = 0) => height / 2 - tileWidth * UI.commonScale * index;

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
        const { x, y } = GameLayer.getCoordinatesFromTag(newTag);
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
        const { x: firstX, y: firstY } = GameLayer.getCoordinatesFromTag(firstTag);
        this.createTile(firstX, firstY, secondColor);
        const { x: secondX, y: secondY } = GameLayer.getCoordinatesFromTag(secondTag);
        this.createTile(secondX, secondY, firstColor);
    }

    tileTouchListener(tag, colorImg) {
        const parent = this;
        const uiLayer = this.scene.getChildByName('ui');

        return {
            event: EventListener.TOUCH_ONE_BY_ONE,
            async onTouchBegan(touch, event) {
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

                if (parent.locked) {
                    return false;
                }
                parent.locked = true;

                const movesElem = uiLayer.getChildByName('moves');
                const pointsElem = uiLayer.getChildByName('points');
                const progressElem = uiLayer.getChildByName('progress');

                const points = parseInt(pointsElem.getString(), 10) + tilesToDelete.length;
                if (points >= winPoints) {
                    director.runScene(new WinScene());
                    parent.locked = false;
                    return false;
                }

                const movesLeft = parseInt(movesElem.getString(), 10) - 1;
                if (movesLeft <= 0) {
                    director.runScene(new LoseScene());
                    parent.locked = false;
                    return false;
                }
                movesElem.setString(movesLeft);
                pointsElem.setString(points);
                progressElem.attr({
                    x: UI.progressBar.x + (progressElem.width * (points * 0.001)) / 2,
                    y: UI.progressBar.y,
                    scaleY: UI.commonScale,
                    scaleX: UI.commonScale + points * 0.001,
                });

                const promises = tilesToDelete.map((deletedTile) => {
                    const tile = parent.instance.getChildByTag(deletedTile);
                    const action = FadeOut.create(1);
                    tile.runAction(action);
                    return sleepWhen(() => {
                        if (action.isDone()) {
                            parent.instance.removeChildByTag(deletedTile);
                            return true;
                        }
                        return false;
                    }, 1);
                });
                await Promise.all(promises);

                const deletedTilesList = tilesToDelete.reduce((result, coordinates) => {
                    const { x, y } = GameLayer.getCoordinatesFromTag(coordinates);
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
                    parent.locked = false;
                    return false;
                }
                parent.locked = false;
                return true;
            },
        };
    }
}
