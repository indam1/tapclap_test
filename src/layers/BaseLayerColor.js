const {
    LayerColor, color, winSize,
} = cc;

export default class BaseLayerColor {
    constructor(scene, layerColor) {
        const LayerInstance = LayerColor.extend({
            ctor() {
                const resultColor = color(layerColor.r, layerColor.g, layerColor.b, layerColor.a);
                this._super(resultColor, winSize.width, winSize.height);
                return true;
            },
        });

        this.scene = scene;
        this.instance = new LayerInstance();
        scene.addChild(this.instance);
    }
}
