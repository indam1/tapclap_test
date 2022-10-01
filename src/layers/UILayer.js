import { res } from '@/resource';
import BaseLayer from './BaseLayer';
import { commonScale, UI } from '../configs/ui';
import { INIT_MOVES, INIT_SCORE } from '../configs/rules';

const { Sprite, LabelTTF } = cc;
export default class UILayer extends BaseLayer {
    constructor(scene, gameState) {
        super(scene, gameState);
        this.init();
    }

    init() {
        this.name = 'ui';
        this.instance.setName('ui');
        // eslint-disable-next-line no-undef
        const panelScore = new Sprite(res.PanelScore_png);
        panelScore.attr({
            x: UI.panelScore.x,
            y: UI.panelScore.y,
            scale: commonScale,
        });
        panelScore.setAnchorPoint(0.5, 1);
        this.instance.addChild(panelScore);
        [
            {
                string: INIT_MOVES,
                name: 'moves',
                fontSize: 256,
                offset: 170,
            },
            {
                string: 'очки:',
                name: 'pointsLabel',
                fontSize: 82,
                offset: 670,
            },
            {
                string: INIT_SCORE,
                name: 'points',
                fontSize: 164,
                offset: 740,
            },
        ].forEach((textData) => {
            this.addText(textData.string, textData.name, textData.fontSize, {
                x: UI.panelScore.x,
                y: UI.panelScore.y - textData.offset * commonScale,
                scale: commonScale,
            });
        });

        // eslint-disable-next-line no-undef
        const bar = new Sprite(res.Bar_png);
        bar.attr({
            scaleX: commonScale,
            scaleY: commonScale,
            x: UI.progressBar.x,
            y: UI.progressBar.y,
        });
        bar.setAnchorPoint(0, 0.5);
        this.instance.addChild(bar);

        // eslint-disable-next-line no-undef
        const progress = new Sprite(res.Progress_png);
        progress.attr({
            scaleX: (commonScale / 0.585) * 0,
            scaleY: commonScale,
            x: UI.progressBar.x,
            y: UI.progressBar.y,
        });
        progress.setName('progress');
        progress.setAnchorPoint(0, 0.5);
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
        this.instance.addChild(text);
    }
}
