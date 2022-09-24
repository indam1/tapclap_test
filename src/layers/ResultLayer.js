import { UI } from '../configs/globalVariables';
import BaseLayerColor from './BaseLayerColor';

const { LabelTTF } = cc;
export default class ResultLayer extends BaseLayerColor {
    constructor(scene, result, color) {
        super(scene, color);
        this.result = result;
        this.init();
    }

    init() {
        this.instance.setName('result');
        this.addText(this.result, 'result', 256, {
            x: UI.panelScore.x,
            y: UI.panelScore.y - 170 * UI.commonScale,
            scale: UI.commonScale,
        });
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
