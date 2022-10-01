import { res } from '@/resource';
import { commonScale, UI } from '../configs/ui';
import { WIDTH, HEIGHT } from '../configs/field';
import BaseLayer from './BaseLayer';
import { LoseScene, WinScene } from '../scene';
import { sleep, sleepWhen } from '../helpers/AsyncHelper';
import { LeeAlgorithm } from '../helpers/AlgorithmHelper';
import { MIXES, WIN_POINTS } from '../configs/rules';
import BaseTile from '../objects/BaseTile';
import { createBomb } from '../helpers/SuperTileHelper';
import { getPositionFromTag, tagsArrayToList, xTilePosition, yTilePosition } from '../helpers/TileHelper';

const { Sprite, winSize, director, FadeOut } = cc;

export default class GameLayer extends BaseLayer {
    locked = false;

    mouseOvered = null;

    tileToReplace = null;

    constructor(scene, gameState) {
        super(scene, gameState);
        this.init();
    }

    init() {
        this.tiles = {};
        this.name = 'game';
        this.instance.setContentSize(cc.winSize.width / 2, cc.winSize.height / 2);
        this.instance.setName('game');
        const field = new Sprite(res.Field_png);
        field.attr({
            x: xTilePosition(winSize.width, 0),
            y: yTilePosition(winSize.height, 0),
            scale: commonScale,
        });
        field.setAnchorPoint(0.03, 0.97);
        this.instance.addChild(field);
        for (let y = HEIGHT - 1; y >= 0; y -= 1) {
            for (let x = 0; x < WIDTH; x += 1) {
                this.tiles[`${x}${y}`] = new BaseTile(this, x, y);
            }
        }
        return true;
    }

    hasChain() {
        for (let y = HEIGHT - 1; y >= 0; y -= 1) {
            for (let x = 0; x < WIDTH; x += 1) {
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
                        this.tiles[oldTag].moveTile(oldTag, newTag);
                        columnArray.push(upperRow);
                        break;
                    }
                }
                columnArray = sortedColumnArray;
            }
        });
    }

    fillEmptyTiles(deletedTilesList) {
        Object.keys(deletedTilesList).forEach((column) => {
            for (let row = deletedTilesList[column].length - 1; row >= 0; row -= 1) {
                this.tiles[`${column}${row}`] = new BaseTile(this, column, row);
            }
        });
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
        const { x: firstX, y: firstY } = getPositionFromTag(firstTag);
        this.tiles[`${firstX}${firstY}`] = new BaseTile(this, firstX, firstY, secondColor);
        const { x: secondX, y: secondY } = getPositionFromTag(secondTag);
        this.tiles[`${secondX}${secondY}`] = new BaseTile(this, secondX, secondY, firstColor);
    }

    selectTileToReplace() {
        if (this.locked) {
            return;
        }
        this.locked = true;
        this.tileToReplace = this.mouseOvered;
    }

    async deleteTiles(tiles) {
        const promises = tiles.map((deletedTile) => {
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
    }

    mixTiles() {
        for (let i = 0; i < MIXES; i += 1) {
            const firstTag = `${Math.floor(Math.random() * WIDTH)}${Math.floor(Math.random() * HEIGHT)}`;
            const secondTag = `${Math.floor(Math.random() * WIDTH)}${Math.floor(Math.random() * HEIGHT)}`;
            if (firstTag !== secondTag) {
                this.swapTiles(firstTag, secondTag);
            }
        }
    }

    createSuperTile(superTileInfo, tiles) {
        const { x, y } = getPositionFromTag(superTileInfo.tag);
        this.tiles[`${x}${y}`] = new BaseTile(this, x, y, superTileInfo.action);
        const tagIndex = tiles.findIndex((tagItem) => tagItem === superTileInfo.tag);
        tiles.splice(tagIndex, 1);
    }

    hasBombConflict(isBomb) {
        return isBomb && !this.mouseOvered;
    }

    async doMove(tiles = null, isBomb = false, superTileInfo = null) {
        if (this.hasBombConflict(isBomb)) {
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

        const tilesToDelete = tiles ?? (isBomb ? createBomb(this.mouseOvered) : []);
        const filteredTilesToDelete = tilesToDelete.filter((tile) => !!this.instance.getChildByTag(tile));
        const points = parseInt(pointsElem.getString(), 10) + filteredTilesToDelete.length;
        const movesLeft = parseInt(movesElem.getString(), 10) - 1;
        movesElem.setString(movesLeft);
        pointsElem.setString(points);

        progressElem.attr({
            x: UI.progressBar.x,
            y: UI.progressBar.y,
            scaleX: (commonScale / 0.585) * (points / WIN_POINTS),
            scaleY: commonScale,
        });

        await this.deleteTiles(filteredTilesToDelete);

        const cloneTiles = JSON.parse(JSON.stringify(filteredTilesToDelete));
        if (superTileInfo) {
            this.createSuperTile(superTileInfo, filteredTilesToDelete);
        }

        const tilesToMove = tagsArrayToList(cloneTiles);
        const deletedTilesToFill = tagsArrayToList(filteredTilesToDelete);

        this.moveDownTiles(tilesToMove);
        this.fillEmptyTiles(deletedTilesToFill);

        if (points >= WIN_POINTS) {
            await sleep(1000);
            director.runScene(new WinScene());
            this.locked = false;
            return false;
        }

        if (movesLeft <= 0) {
            await sleep(1000);
            director.runScene(new LoseScene());
            this.locked = false;
            return false;
        }

        if (!this.hasChain()) {
            this.mixTiles();
            this.locked = false;
            return false;
        }

        this.locked = false;
        return true;
    }
}
