import { res } from '@/resource';

const UILayer = cc.Layer.extend({
    sprite: null,
    addText(string, name, fontSize, attr) {
        const text = new cc.LabelTTF();
        text.setString(string);
        text.setName(name);
        text.setFontSize(fontSize);
        text.setFontName('Marvin');
        text.attr(attr);
        this.addChild(text);
    },
    ctor() {
        this._super();
        this.setName('ui');
        // eslint-disable-next-line no-undef
        const sprite = new cc.Sprite(res.PanelScore_png);
        sprite.attr({
            x: 200,
            y: 200,
            scale: 0.3,
        });
        this.addChild(sprite);
        this.addText('50', 'moves', 256, { x: 200, y: 255, scale: 0.3 });
        this.addText('очки:', 'pointsLabel', 82, { x: 200, y: 145, scale: 0.3 });
        this.addText('0', 'points', 164, { x: 200, y: 105, scale: 0.3 });

        // eslint-disable-next-line no-undef
        const bar = new cc.Sprite(res.Bar_png);
        bar.attr({
            scaleX: 0.3,
            scaleY: 0.3,
            x: 275,
            y: 600,
        });
        this.addChild(bar);

        // eslint-disable-next-line no-undef
        const progress = new cc.Sprite(res.Progress_png);
        progress.attr({
            scaleX: 0.3,
            scaleY: 0.3,
            x: 200,
            y: 600,
        });
        progress.setName('progress');
        this.addChild(progress);
        return true;
    },
});

export default UILayer;
