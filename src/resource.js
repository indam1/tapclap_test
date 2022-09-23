import Blue from '../res/tileImages/Blue.png';
import Green from '../res/tileImages/Green.png';
import Purple from '../res/tileImages/Purple.png';
import Red from '../res/tileImages/Red.png';
import Yellow from '../res/tileImages/Yellow.png';
import Bar from '../res/uiImages/Bar.png';
import PanelScore from '../res/uiImages/PanelScore.png';
import Progress from '../res/uiImages/Progress.png';

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
