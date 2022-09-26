import UILayer from './layers/UILayer';
import GameLayer from './layers/GameLayer';
import BaseLayerColor from './layers/BaseLayerColor';
import BoosterLayer from './layers/BoosterLayer';

const gameState = [];
const GameScene = cc.Scene.extend({
    onEnter() {
        this._super();
        const colorLayer = new BaseLayerColor(this, {
            r: 161,
            g: 161,
            b: 161,
            a: 255,
        });
        gameState.push(colorLayer);
        const uiLayer = new UILayer(this, gameState);
        gameState.push(uiLayer);
        const gameLayer = new GameLayer(this, gameState);
        gameState.push(gameLayer);
        const boosterLayer = new BoosterLayer(this, gameState);
        gameState.push(boosterLayer);
    },
});

export default GameScene;
