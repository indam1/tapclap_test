const {
    Layer,
} = cc;

export default class BaseLayer {
    constructor(scene) {
        const LayerInstance = Layer.extend({
            ctor() {
                this._super();
                return true;
            },
        });

        this.scene = scene;
        this.instance = new LayerInstance();
        scene.addChild(this.instance);
    }
}
