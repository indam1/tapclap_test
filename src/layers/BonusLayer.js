import { res } from '@/resource';
import BaseLayer from './BaseLayer';
import { InitBonuses, UI } from '../configs/globalVariables';

const {
    Sprite, LabelTTF, eventManager, EventListener, rect, rectContainsPoint,
} = cc;
export default class BonusLayer extends BaseLayer {
    constructor(scene, gameState) {
        super(scene, gameState);
        this.init();
    }

    init() {
        this.instance.setContentSize(cc.winSize.width / 2, cc.winSize.height / 2);
        this.instance.setName('bonus');
        [{ name: 'bomb' }, { name: 'teleport' }].forEach((bonus) => {
            this.addBonus(bonus.name);
        });
    }

    addBonus(name) {
        const bonus = new Sprite(res.Bonus_png);
        bonus.setAnchorPoint(0.5, 1);
        bonus.setName(name);
        bonus.attr({
            x: UI.bonuses[name].x,
            y: UI.bonuses[name].y,
            scale: UI.commonScale,
        });
        this.instance.addChild(bonus);
        this.addText(InitBonuses[name], `${name}Text`, 80, {
            x: UI.bonuses[name].x - 30 * UI.commonScale,
            y: UI.bonuses[name].y - 265 * UI.commonScale,
            scale: UI.commonScale,
        });
        eventManager.addListener(this.eventListener(name), bonus);
    }

    eventListener(name) {
        const { instance } = this;
        const tag = 123;
        const gameLayer = this.gameState.find((layer) => layer.name === 'game');
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

                const bonus = new Sprite(res.Blue_png);
                bonus.attr({
                    x: touch.getLocationX(),
                    y: touch.getLocationY(),
                    scale: UI.commonScale,
                });
                bonus.setTag(tag);
                instance.addChild(bonus);
                return true;
            },
            onTouchMoved(touch) {
                const bonus = instance.getChildByTag(tag);
                bonus.setPositionX(touch.getLocationX());
                bonus.setPositionY(touch.getLocationY());
            },
            async onTouchEnded() {
                instance.removeChildByTag(tag);
                if (name === 'bomb') {
                    await gameLayer.deleteTiles(null, true);
                }
                if (name === 'teleport') {
                    gameLayer.selectTileToReplace();
                }
            },
        };
    }

    addText(string, name, fontSize, attr) {
        const text = new LabelTTF();
        text.setAnchorPoint(0.5, 1);
        text.setString(string);
        text.setName(name);
        text.setFontSize(fontSize);
        text.setFontName('Marvin');
        text.attr(attr);
        text.setLocalZOrder(10);
        this.instance.addChild(text);
    }
}
