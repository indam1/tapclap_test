const res = {
    HelloWorld_png : 'res/HelloWorld.png',
    Blue_png : 'res/Blue.png',
    Green_png : 'res/Green.png',
    Purple_png : 'res/Purple.png',
    Red_png : 'res/Red.png',
    Yellow_png : 'res/Yellow.png',
    PanelScore_png: 'res/PanelScore.png',
    Marvin_font: {
        type: "font",
        name: "Marvin",
        srcs: ['res/Marvin.ttf']
    },
    Progress_png: 'res/Progress.png',
    Bar_png: 'res/Bar.png'
};

const g_resources = [];
for (let i in res) {
    g_resources.push(res[i]);
}
