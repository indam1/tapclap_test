import { res } from '@/resource';

const { Layer, Sprite, LabelTTF } = cc;
export default class UILayer {
    constructor(scene) {
        const Instance = Layer.extend({
            ctor() {
                this._super();
                return true;
            },
        });

        this.scene = scene;
        this.instance = new Instance();
        this.init();
        scene.addChild(this.instance);
    }

    init() {
        this.instance.setName('ui');
        // eslint-disable-next-line no-undef
        const sprite = new Sprite(res.PanelScore_png);
        sprite.attr({
            x: 200,
            y: 200,
            scale: 0.3,
        });
        this.instance.addChild(sprite);
        this.addText('50', 'moves', 256, { x: 200, y: 255, scale: 0.3 });
        this.addText('очки:', 'pointsLabel', 82, { x: 200, y: 145, scale: 0.3 });
        this.addText('0', 'points', 164, { x: 200, y: 105, scale: 0.3 });

        // eslint-disable-next-line no-undef
        const bar = new Sprite(res.Bar_png);
        bar.attr({
            scaleX: 0.3,
            scaleY: 0.3,
            x: 275,
            y: 600,
        });
        this.instance.addChild(bar);

        // eslint-disable-next-line no-undef
        const progress = new Sprite(res.Progress_png);
        progress.attr({
            scaleX: 0.3,
            scaleY: 0.3,
            x: 200,
            y: 600,
        });
        progress.setName('progress');
        this.instance.addChild(progress);
    }

    addText(string, name, fontSize, attr) {
        const text = new LabelTTF();
        text.setString(string);
        text.setName(name);
        text.setFontSize(fontSize);
        text.setFontName('Marvin');
        text.attr(attr);
        this.instance.addChild(text);
    }

    getInstance() {
        return this.instance;
    }
}
