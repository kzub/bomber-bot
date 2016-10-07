const getReadOnlyProxy = function (object, text) {
    return new Proxy(object, {
        get: function(target, name){
            return target[name];
        },
        set: function(obj, prop, value) {
            throw text;
        }
    });
};

const getRandomFromArray = function (arr) {
    return arr[ Math.floor(Math.random()*(arr.length - 0.1)) ];
};

const getSequencedFromArray = function (arr) {
    if (this.counter === undefined) {
        this.counter = -1;
    }
    this.counter++;

    if (this.counter % arr.length === 0) {
        this.counter = 0;
    }

    return arr[this.counter];
};


const makeBricks = function(game) {
    var bricks = new Phaser.Group(game);

    for (var Y in MAP){
        for (var X in MAP[Y]){
            if(MAP[Y][X] === WALL){
                bricks.add(
                    game.add.sprite(
                        X*SPACE.X,
                        Y*SPACE.Y,
                        'bricks',
                        getRandomFromArray(WALLS)
                    )
                );
            }
        }
    }

    game.physics.arcade.enable(bricks);
    bricks.setAll('body.immovable', true);
    return bricks;
};
