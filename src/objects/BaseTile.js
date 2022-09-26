import { commonScale } from '../configs/ui';
import { isInRect } from '../helpers/PositionHelper';
import { LeeAlgorithm } from '../helpers/AlgorithmHelper';
import { selectAction, selectTilesBySuper } from '../helpers/SuperTileHelper';
import {
    getPositionFromTag, selectColor, xTilePosition, yTilePosition,
} from '../helpers/TileHelper';

const {
    Sprite, eventManager, winSize, FadeIn, EventListener,
} = cc;

export default class BaseTile {
    constructor(gameLayer, x, y, color = null) {
        this.gameLayer = gameLayer;
        this.x = x;
        this.y = y;
        this.tag = `${x}${y}`;
        this.color = color ?? selectColor();
        this.init();
    }

    init() {
        const tile = new Sprite(this.color);
        tile.attr({
            x: xTilePosition(winSize.width, this.x, tile.width),
            y: yTilePosition(winSize.height, this.y, tile.width),
            scale: commonScale,
        });
        tile.setTag(this.tag);
        tile.setName(this.tag);
        tile.setAnchorPoint(0, 1);
        if (!this.color) {
            tile.setOpacity(0);
        }
        tile.runAction(FadeIn.create(1));
        eventManager.addListener(this.tileTouchListener(), tile);
        eventManager.addListener(this.tileMouseListener(), tile);
        this.gameLayer.instance.addChild(tile);
        this.tile = this.gameLayer.instance.getChildByTag(this.tag);
    }

    tileMouseListener() {
        const parent = this;
        return {
            event: EventListener.MOUSE,
            onMouseMove(event) {
                if (!isInRect(event, parent.tile)) {
                    if (parent.gameLayer.mouseOvered === parent.tag) {
                        parent.gameLayer.mouseOvered = null;
                    }
                    return;
                }
                parent.gameLayer.mouseOvered = parent.tag;
            },
        };
    }

    tileTouchListener() {
        const parent = this;
        return {
            event: EventListener.TOUCH_ONE_BY_ONE,
            async onTouchBegan(touch, event) {
                const target = event.getCurrentTarget();
                if (!isInRect(touch, target)) {
                    return false;
                }

                if (parent.gameLayer.tileToReplace) {
                    parent.gameLayer.swapTiles(parent.gameLayer.tileToReplace, parent.tag);
                    parent.gameLayer.tileToReplace = null;
                    parent.gameLayer.locked = false;
                    return true;
                }

                const tilesBySuper = selectTilesBySuper(target.texture.url, parent.tag);
                if (tilesBySuper.length) {
                    await parent.gameLayer.doMove(tilesBySuper);
                    return true;
                }

                const tilesToDelete = LeeAlgorithm({
                    tag: parent.tag,
                    colorImg: parent.color,
                }, parent.gameLayer.instance);
                if (!tilesToDelete) {
                    return false;
                }

                const superTileInfo = selectAction(tilesToDelete.length, parent.tag);
                return parent.gameLayer.doMove(tilesToDelete, false, superTileInfo);
            },
        };
    }

    moveTile(oldTag, newTag) {
        const oldPlace = this.gameLayer.instance.getChildByTag(oldTag);
        if (!oldPlace) {
            return;
        }
        const newPlace = this.gameLayer.instance.getChildByTag(newTag);
        if (newPlace) {
            return;
        }

        const color = oldPlace.texture.url;
        this.gameLayer.instance.removeChildByTag(oldTag, true);
        const { x, y } = getPositionFromTag(newTag);
        this.gameLayer.tiles[`${x}${y}`] = new BaseTile(this.gameLayer, x, y, color);
    }
}
