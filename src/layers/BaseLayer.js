const {
    Layer,
} = cc;

export default class BaseLayer {
    constructor(scene, gameState) {
        const LayerInstance = Layer.extend({
            ctor() {
                this._super();
                return true;
            },
        });

        this.gameState = gameState;
        this.scene = scene;
        this.instance = new LayerInstance();
        scene.addChild(this.instance);
    }
}
