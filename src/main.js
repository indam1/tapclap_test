const { game } = cc;
game.onStart = () => {
    import('@/config').then((config) => {
        config.default();
    });
};

game.run();
