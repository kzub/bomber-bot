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

const SequencedArray = function (arr) {
    var counter = 0;
    return function(){
        if (counter % arr.length === 0) {
            counter = 0;
        }
        return arr[counter++];
    };
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

const zeroPad = function(str, pad) {
    if (str === undefined) { return; }
    if (typeof str != "string") {
        str = String(str);
    }
    if (str.length >= pad) {
        return str;
    }

    for (var idx = str.length; idx < pad; idx++) {
        str = "0" + str;
    }
    return str;
};
