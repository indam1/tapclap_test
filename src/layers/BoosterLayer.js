import { res } from '@/resource';
import BaseLayer from './BaseLayer';
import { INIT_BOOSTERS } from '../configs/booster';
import { commonScale, UI } from '../configs/ui';
import { isInRect } from '../helpers/PositionHelper';

const { Sprite, LabelTTF, eventManager, EventListener } = cc;
export default class BoosterLayer extends BaseLayer {
    constructor(scene, gameState) {
        super(scene, gameState);
        this.init();
    }

    init() {
        this.instance.setContentSize(cc.winSize.width / 2, cc.winSize.height / 2);
        this.instance.setName('booster');
        [{ name: 'bomb' }, { name: 'teleport' }].forEach((booster) => {
            this.initBooster(booster.name);
        });
    }

    initBooster(name) {
        const booster = new Sprite(res.Booster_png);
        booster.setAnchorPoint(0.5, 1);
        booster.setName(name);
        booster.attr({
            x: UI[name].x,
            y: UI[name].y,
            scale: commonScale,
        });
        this.instance.addChild(booster);
        this.addText(INIT_BOOSTERS[name], `${name}Text`, 80, {
            x: UI[name].x - 30 * commonScale,
            y: UI[name].y - 265 * commonScale,
            scale: commonScale,
        });
        eventManager.addListener(this.eventListener(name), booster);
    }

    eventListener(name) {
        const { instance } = this;
        const tag = 123;
        const gameLayer = this.gameState.find((layer) => layer.name === 'game');
        return {
            event: EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan(touch, event) {
                const target = event.getCurrentTarget();
                if (!isInRect(touch, target)) {
                    return false;
                }

                const booster = new Sprite(res.Blue_png);
                booster.attr({
                    x: touch.getLocationX(),
                    y: touch.getLocationY(),
                    scale: commonScale,
                });
                booster.setTag(tag);
                instance.addChild(booster);
                return true;
            },
            onTouchMoved(touch) {
                const booster = instance.getChildByTag(tag);
                booster.setPositionX(touch.getLocationX());
                booster.setPositionY(touch.getLocationY());
            },
            async onTouchEnded() {
                instance.removeChildByTag(tag);
                if (name === 'bomb') {
                    await gameLayer.doMove(null, true);
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
