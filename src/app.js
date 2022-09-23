import UILayer from './uiLayer';
import GameLayer from './gameLayer';

// eslint-disable-next-line no-unused-vars
const GameScene = cc.Scene.extend({
    onEnter() {
        this._super();
        cc.log('first');
        const uiLayer = new UILayer();
        this.addChild(uiLayer);
        cc.log('second');
        const gameLayer = new GameLayer();
        this.addChild(gameLayer);
        cc.log('third');
    },
});

export default GameScene;
