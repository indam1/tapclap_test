import Blue from '../res/tiles/Blue.png';
import Green from '../res/tiles/Green.png';
import Purple from '../res/tiles/Purple.png';
import Red from '../res/tiles/Red.png';
import Yellow from '../res/tiles/Yellow.png';
import Bar from '../res/Bar.png';
import PanelScore from '../res/PanelScore.png';
import Progress from '../res/Progress.png';

const res = {
    Blue_png: Blue,
    Green_png: Green,
    Purple_png: Purple,
    Red_png: Red,
    Yellow_png: Yellow,
    Bar_png: Bar,
    PanelScore_png: PanelScore,
    Progress_png: Progress,
    Marvin_font: {
        type: 'font',
        name: 'Marvin',
        srcs: ['res/fonts/Marvin.ttf'],
    },
};

const gResources = Object.keys(res).map((key) => res[key]);

export { res, gResources };
