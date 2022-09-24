import ResultLayer from './layers/ResultLayer';

export const LoseScene = cc.Scene.extend({
    onEnter() {
        this._super();
        // eslint-disable-next-line no-unused-vars
        const resultLayer = new ResultLayer(this, 'Проигрыш', {
            r: 255,
            g: 0,
            b: 0,
            a: 255,
        });
    },
});

export const WinScene = cc.Scene.extend({
    onEnter() {
        this._super();
        // eslint-disable-next-line no-unused-vars
        const resultLayer = new ResultLayer(this, 'Победа', {
            r: 0,
            g: 255,
            b: 0,
            a: 255,
        });
    },
});
