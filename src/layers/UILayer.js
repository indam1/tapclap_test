import { res } from '@/resource';
import BaseLayer from './BaseLayer';
import { InitMoves, InitScore, UI } from '../configs/globalVariables';

const { Sprite, LabelTTF } = cc;
export default class UILayer extends BaseLayer {
    constructor(scene) {
        super(scene);
        this.init();
    }

    init() {
        this.instance.setName('ui');
        // eslint-disable-next-line no-undef
        const panelScore = new Sprite(res.PanelScore_png);
        panelScore.attr({
            x: UI.panelScore.x,
            y: UI.panelScore.y,
            scale: UI.commonScale,
        });
        panelScore.setAnchorPoint(0.5, 1);
        panelScore.setLocalZOrder(10);
        this.instance.addChild(panelScore);
        this.addText(InitMoves, 'moves', 256, {
            x: UI.panelScore.x,
            y: UI.panelScore.y - 170 * UI.commonScale,
            scale: UI.commonScale,
        });
        this.addText('очки:', 'pointsLabel', 82, {
            x: UI.panelScore.x,
            y: UI.panelScore.y - 670 * UI.commonScale,
            scale: UI.commonScale,
        });
        this.addText(InitScore, 'points', 164, {
            x: UI.panelScore.x,
            y: UI.panelScore.y - 740 * UI.commonScale,
            scale: UI.commonScale,
        });

        // eslint-disable-next-line no-undef
        const bar = new Sprite(res.Bar_png);
        bar.attr({
            scaleX: UI.commonScale,
            scaleY: UI.commonScale,
            x: UI.progressBar.x + 250 * UI.commonScale,
            y: UI.progressBar.y,
        });
        bar.setLocalZOrder(10);
        this.instance.addChild(bar);

        // eslint-disable-next-line no-undef
        const progress = new Sprite(res.Progress_png);
        progress.attr({
            scaleX: UI.commonScale,
            scaleY: UI.commonScale,
            x: UI.progressBar.x,
            y: UI.progressBar.y,
        });
        progress.setLocalZOrder(10);
        progress.setName('progress');
        this.instance.addChild(progress);
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
