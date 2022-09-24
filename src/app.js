import UILayer from './layers/UILayer';
import GameLayer from './layers/GameLayer';
import BaseLayerColor from './layers/BaseLayerColor';

const GameScene = cc.Scene.extend({
    onEnter() {
        this._super();
        // eslint-disable-next-line no-unused-vars
        const colorLayer = new BaseLayerColor(this, {
            r: 161,
            g: 161,
            b: 161,
            a: 255,
        });
        // eslint-disable-next-line no-unused-vars
        const uiLayer = new UILayer(this);
        // eslint-disable-next-line no-unused-vars
        const gameLayer = new GameLayer(this);
    },
});

export default GameScene;
