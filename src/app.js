import { UILayer } from './uiLayer';
import { GameLayer } from './gameLayer';
import { Scene } from 'cc';

const GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        const uiLayer = new UILayer();
        this.addChild(uiLayer);
        const gameLayer = new GameLayer();
        this.addChild(gameLayer);
    }
});

