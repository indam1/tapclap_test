import UILayer from './layers/uiLayer';
import GameLayer from './layers/gameLayer';

const GameScene = cc.Scene.extend({
    onEnter() {
        this._super();
        // eslint-disable-next-line no-unused-vars
        const uiLayer = new UILayer(this);
        // eslint-disable-next-line no-unused-vars
        const gameLayer = new GameLayer(this);
    },
});

export default GameScene;
