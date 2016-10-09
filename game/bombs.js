const makeBomb = function (player, map) {
    var pp = player.pp;
    var map = player.map;
    var game = pp.game;
    var bomb_birth = Date.now();
    var bomb = new Phaser.Group(game);
    var radius = player.bombRadius;
    bomb.position.x = Math.floor(pp.body.x / SPACE.X)*SPACE.X;
    bomb.position.y = Math.floor(pp.body.y / SPACE.Y)*SPACE.Y;

    var map_x = Math.floor(bomb.position.x / SPACE.X);
    var map_y = Math.floor(bomb.position.y / SPACE.Y);

    var bomb_info = {
        exists: true,
        type: 'bomb',
        owner: player.id,
        x: map_x,
        y: map_y,
        birth: bomb_birth,
        expode: bomb_birth + BOMB_EXPOLDE,
        vanish: bomb_birth + BOMB_EXPLOSION_FINISH
    };

    function addFlames(x_or_y, direction, sprites_body, sprites_end, callback) {
        var xm = x_or_y === 'x' ? 1 : 0;
        var ym = x_or_y === 'y' ? 1 : 0;;

        for(var i = 1; i <= radius; i++){
            if (map(map_x + xm * direction * i, map_y + ym * direction * i) === WALL) {
                return;
            }
            var flame = game.add.sprite(0, 0, 'flames', 34);
            flame.position[x_or_y] = SPACE[x_or_y.toUpperCase()] * direction * i;
            var sprites = i == radius ? sprites_end : sprites_body;
            var animation = flame.animations
                .add('explosion', sprites, 15, false)
                .play();
            bomb.add(flame);

            if (callback) {
                animation.onComplete.add(callback);
            }
        }
    }

    // bomb drawing
    var center = game.add.sprite(0, 0, 'bomb', 30);
    game.physics.arcade.enable(center);
    center.body.immovable = true;
    bomb.add(center);

    center.animations
        .add('moving',
            [ 30, 29, 28, 29, 30, 29, 28, 29, 30, 29, 28, 29, 30, 29, 28, 29, 30 ], 10, false)
        .play()
        .onComplete.add(function onBombExplosion(){
            center.kill();
            game.add.sound('explode').play();
            // console.log('bomb explode time:', Date.now()- bomb_birth)

            addFlames('x',  0, [ 0, 1, 2, 3, 2, 1, 0 ],
                               [ 0, 1, 2, 3, 2, 1, 0 ], function onComplete(){
                bomb_info.exists = false;
                bomb.alive = false;
                bomb.destroy();
            });
            addFlames('x', +1, [8 , 9 , 10, 11, 10, 9 , 8 ],
                               [16, 17, 18, 19, 18, 17, 16]);
            addFlames('x', -1, [8 , 9 , 10, 11, 10, 9 , 8 ],
                               [4 , 5 , 6 , 7 , 6 , 5 , 4 ]);
            addFlames('y', -1, [20, 21, 22, 23, 22, 21, 20],
                               [12, 13, 14, 15, 14, 13, 12]);
            addFlames('y', +1, [20, 21, 22, 23, 22, 21, 20],
                               [24, 25, 26, 27, 26, 25, 24]);

            game.physics.arcade.enable(bomb);
            bomb.setAll('body.immovable', true);
        });

    return {
        info: getReadOnlyProxy(bomb_info, 'Bomb objects modifications are forbidden'),
        group: bomb
    };
};

const touchingBomb = function(player, sprite) {
    if(sprite.key == 'flames'){
        killPlayer(player);
    }
};