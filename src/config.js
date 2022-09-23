import GameScene from '@/app';
import { gResources } from '@/resource';

export default () => {
    const {
        sys, view, LoaderScene, director, ResolutionPolicy,
    } = cc;
    if (!sys.isNative && document.getElementById('cocosLoading')) {
        document.body.removeChild(document.getElementById('cocosLoading'));
    }

    // Pass true to enable retina display, on Android disabled by default to improve performance
    view.enableRetina(sys.os === sys.OS_IOS);

    // Disable auto full screen on baidu and wechat, you might also want to eliminate sys.BROWSER_TYPE_MOBILE_QQ
    if (sys.isMobile && sys.browserType !== sys.BROWSER_TYPE_BAIDU && sys.browserType !== sys.BROWSER_TYPE_WECHAT) {
        view.enableAutoFullScreen(true);
    }

    // Adjust viewport meta
    view.adjustViewPort(true);

    // Uncomment the following line to set a fixed orientation for your game
    // view.setOrientation(cc.ORIENTATION_PORTRAIT);

    // Setup the resolution policy and design resolution size
    view.setDesignResolutionSize(960, 640, ResolutionPolicy.SHOW_ALL);

    // The game will be resized when browser size change
    view.resizeWithBrowserSize(true);

    LoaderScene.preload(
        gResources,
        () => {
            director.runScene(new GameScene());
        },
        this,
    );
};
