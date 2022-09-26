import { res } from '@/resource';
import {
    N, M, S, UI, winPoints,
} from '../configs/globalVariables';
import BaseLayer from './BaseLayer';
import { LoseScene, WinScene } from '../scene';
import { sleepWhen } from '../helpers/AsyncHelper';
import { LeeAlgorithm } from '../helpers/AlgorithmHelper';

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

    mouseOvered = null;

    tileToReplace = null;

    constructor(scene, gameState) {
        super(scene, gameState);
        this.init();
    }

    init() {
        this.name = 'game';
        this.instance.setContentSize(cc.winSize.width / 2, cc.winSize.height / 2);
        this.instance.setName('game');
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
        this.instance.addChild(tile);
        if (!color) {
            tile.setOpacity(0);
        }
        tile.runAction(FadeIn.create(1));
        const tag = `${x}${y}`;
        tile.setTag(tag);
        eventManager.addListener(this.tileTouchListener(tag, colorImg), tile);
        eventManager.addListener(this.tileMouseListener(tag), tile);
    }

    static xTilePosition = (width, index, tileWidth = 0) => width / 2 + tileWidth * UI.commonScale * index;

    static yTilePosition = (height, index, tileWidth = 0) => height / 1.5 - tileWidth * UI.commonScale * index;

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
                const tilesToDelete = LeeAlgorithm({ tag, colorImg }, this.instance);
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
            for (let i = deletedTilesList[column].length - 1; i >= 0; i -= 1) {
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

    // Проходим по кругу по сторонам ромба и вносим его координаты
    static createBomb(tag) {
        const R = 4;
        const { x, y } = GameLayer.getCoordinatesFromTag(tag); // 3;4
        const tiles = [];
        for (let i = 0; i < R; i += 1) {
            const diagonalIterations = R - i;
            for (let j = 0; j < diagonalIterations; j += 1) {
                const tagX = x - R + 1 + j + i;
                const tagY = y + j;
                tiles.push(`${tagX}${tagY}`);
            }
            for (let j = 0; j < diagonalIterations - 1; j += 1) {
                const tagX = x + 1 + j;
                const tagY = y + R - 2 - j - i;
                tiles.push(`${tagX}${tagY}`);
            }
            for (let j = 0; j < diagonalIterations - 1; j += 1) {
                const tagX = x + R - 2 - j - i;
                const tagY = y - 1 - j;
                tiles.push(`${tagX}${tagY}`);
            }
            for (let j = 0; j < diagonalIterations - 2; j += 1) {
                const tagX = x - 1 - j;
                const tagY = y - R + 2 + j + i;
                tiles.push(`${tagX}${tagY}`);
            }
        }
        return tiles;
    }

    selectTileToReplace() {
        if (this.locked) {
            return;
        }
        this.locked = true;
        this.tileToReplace = this.mouseOvered;
    }

    selectTilesToDelete(isBomb) {
        return isBomb ? GameLayer.createBomb(this.mouseOvered) : [];
    }

    async deleteTiles(tiles = null, isBomb = false, superTileInfo = null) {
        if (isBomb && !this.mouseOvered) {
            return false;
        }
        if (this.locked) {
            return false;
        }
        this.locked = true;
        const uiLayer = this.scene.getChildByName('ui');
        const movesElem = uiLayer.getChildByName('moves');
        const pointsElem = uiLayer.getChildByName('points');
        const progressElem = uiLayer.getChildByName('progress');

        const tilesToDelete = tiles ?? this.selectTilesToDelete(isBomb);
        const filteredTilesToDelete = tilesToDelete.filter((tile) => !!this.instance.getChildByTag(tile));
        const points = parseInt(pointsElem.getString(), 10) + filteredTilesToDelete.length;
        if (points >= winPoints) {
            director.runScene(new WinScene());
            this.locked = false;
            return false;
        }

        const movesLeft = parseInt(movesElem.getString(), 10) - 1;
        if (movesLeft <= 0) {
            director.runScene(new LoseScene());
            this.locked = false;
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

        const promises = filteredTilesToDelete.map((deletedTile) => {
            const tile = this.instance.getChildByTag(deletedTile);
            if (!tile) {
                return null;
            }
            const action = FadeOut.create(1);
            tile.runAction(action);
            return sleepWhen(() => {
                if (action.isDone()) {
                    this.instance.removeChildByTag(deletedTile);
                    return true;
                }
                return false;
            }, 1);
        });
        await Promise.all(promises);

        const newObj = JSON.parse(JSON.stringify(filteredTilesToDelete));
        if (superTileInfo) {
            const { x, y } = GameLayer.getCoordinatesFromTag(superTileInfo.tag);
            this.createTile(x, y, superTileInfo.action);
            const tagIndex = filteredTilesToDelete.findIndex((tagItem) => tagItem === superTileInfo.tag);
            filteredTilesToDelete.splice(tagIndex, 1);
        }

        const tilesToMove = newObj.reduce((result, coordinates) => {
            const { x, y } = GameLayer.getCoordinatesFromTag(coordinates);
            if (!result[x]) {
                result[x] = [];
            }
            result[x].push(y);
            return result;
        }, {});

        const deletedTilesToFill = filteredTilesToDelete.reduce((result, coordinates) => {
            const { x, y } = GameLayer.getCoordinatesFromTag(coordinates);
            if (!result[x]) {
                result[x] = [];
            }
            result[x].push(y);
            return result;
        }, {});

        this.moveDownTiles(tilesToMove);
        this.fillTiles(deletedTilesToFill);

        if (!this.hasChain()) {
            for (let i = 0; i < S; i += 1) {
                const firstTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                const secondTag = `${Math.floor(Math.random() * N)}${Math.floor(Math.random() * M)}`;
                if (firstTag !== secondTag) {
                    this.swapTiles(firstTag, secondTag);
                }
            }
            this.locked = false;
            return false;
        }
        this.locked = false;
        return true;
    }

    tileMouseListener(tag) {
        const tile = this.instance.getChildByTag(tag);
        const parent = this;
        return {
            event: EventListener.MOUSE,
            onMouseMove(event) {
                const locationInNode = tile.convertToNodeSpace(event.getLocation());
                const s = tile.getContentSize();
                const myRect = rect(0, 0, s.width, s.height);
                if (!rectContainsPoint(myRect, locationInNode)) {
                    if (parent.mouseOvered === tag) {
                        parent.mouseOvered = null;
                    }
                    return;
                }
                parent.mouseOvered = tag;
            },
        };
    }

    static selectAction(length, tag) {
        const superTileInfo = { tag };
        if (length >= 10) {
            superTileInfo.action = res.SuperAll_png;
            return superTileInfo;
        }
        if (length >= 8) {
            superTileInfo.action = res.SuperBomb_png;
            return superTileInfo;
        }
        if (length >= 6) {
            superTileInfo.action = res.SuperColumn_png;
            return superTileInfo;
        }
        if (length >= 4) {
            superTileInfo.action = res.SuperRow_png;
            return superTileInfo;
        }
        return null;
    }

    tileTouchListener(tag, colorImg) {
        const parent = this;

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

                if (parent.tileToReplace) {
                    parent.swapTiles(parent.tileToReplace, tag);
                    parent.tileToReplace = null;
                    parent.locked = false;
                    return true;
                }

                if (target.texture.url === res.SuperAll_png) {
                    const superTiles = [];
                    for (let i = 0; i < N; i += 1) {
                        for (let j = 0; j < M; j += 1) {
                            superTiles.push(`${i}${j}`);
                        }
                    }
                    await parent.deleteTiles(superTiles);
                    return true;
                }

                if (target.texture.url === res.SuperRow_png) {
                    const { y } = GameLayer.getCoordinatesFromTag(tag);
                    const superTiles = [];
                    for (let i = 0; i < N; i += 1) {
                        superTiles.push(`${i}${y}`);
                    }
                    await parent.deleteTiles(superTiles);
                    return true;
                }

                if (target.texture.url === res.SuperColumn_png) {
                    const { x } = GameLayer.getCoordinatesFromTag(tag);
                    const superTiles = [];
                    for (let i = 0; i < M; i += 1) {
                        superTiles.push(`${x}${i}`);
                    }
                    await parent.deleteTiles(superTiles);
                    return true;
                }

                if (target.texture.url === res.SuperBomb_png) {
                    parent.mouseOvered = tag;
                    await parent.deleteTiles(null, true);
                    return true;
                }

                const tilesToDelete = LeeAlgorithm({ tag, colorImg }, parent.instance);
                if (!tilesToDelete) {
                    return false;
                }

                const superTileInfo = GameLayer.selectAction(tilesToDelete.length, tag);
                return parent.deleteTiles(tilesToDelete, false, superTileInfo);
            },
        };
    }
}
