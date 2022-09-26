import Blue from '../res/tileImages/Blue.png';
import Green from '../res/tileImages/Green.png';
import Purple from '../res/tileImages/Purple.png';
import Red from '../res/tileImages/Red.png';
import Yellow from '../res/tileImages/Yellow.png';
import SuperAll from '../res/tileImages/SuperAll.png';
import SuperRow from '../res/tileImages/SuperRow.png';
import SuperColumn from '../res/tileImages/SuperColumn.png';
import SuperBomb from '../res/tileImages/SuperBomb.png';
import Bar from '../res/uiImages/Bar.png';
import PanelScore from '../res/uiImages/PanelScore.png';
import Progress from '../res/uiImages/Progress.png';
import Field from '../res/uiImages/Field.png';
import Booster from '../res/uiImages/Booster.png';

const res = {
    Blue_png: Blue,
    Green_png: Green,
    Purple_png: Purple,
    Red_png: Red,
    Yellow_png: Yellow,
    SuperAll_png: SuperAll,
    SuperRow_png: SuperRow,
    SuperColumn_png: SuperColumn,
    SuperBomb_png: SuperBomb,
    Bar_png: Bar,
    PanelScore_png: PanelScore,
    Progress_png: Progress,
    Field_png: Field,
    Booster_png: Booster,
    Marvin_font: {
        type: 'font',
        name: 'Marvin',
        srcs: ['res/fonts/Marvin.ttf'],
    },
};

const gResources = Object.keys(res).map((key) => res[key]);

export { res, gResources };
