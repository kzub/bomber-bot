const makeBomb = function (player, map) {
    var pp = player.pp;
    var map = player.map;
    var game = pp.game;
    var bomb_birth = Date.now();
    var bomb = new Phaser.Group(game);

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

    var barrier = {
        up: false, down: false, left: false, right: false
    };

    if (map(map_x, map_y + 1) === WALL) {
        barrier.down = true;
    }
    if (map(map_x, map_y - 1) === WALL) {
        barrier.up = true;
    }
    if (map(map_x - 1, map_y) === WALL) {
        barrier.left = true;
    }
    if (map(map_x + 1, map_y) === WALL) {
        barrier.right = true;
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
        .onComplete.add(function(){
            center.kill();
            game.add.sound('explode').play();
            // console.log('bomb explode time:', Date.now()- bomb_birth)

            // bomb flames
            var flame_center = game.add.sprite(0, 0, 'flames', 34);
            flame_center.animations
                .add('explosion', [ 0, 1, 2, 3, 2, 1, 0 ], 10, false)
                .play()
                .onComplete.add(function(){
                    bomb_info.exists = false;
                    bomb.alive = false;
                    bomb.destroy();
                    // console.log('bomb explosion finsh time:', Date.now()- bomb_birth)
                });
            bomb.add(flame_center);

            if (!barrier.right) {
                var flame_right = game.add.sprite(0, 0, 'flames', 34);
                flame_right.position.x = SPACE.X;
                flame_right.animations
                    .add('explosion', [16, 17, 18, 19, 18, 17, 16], 10, false)
                    .play();
                bomb.add(flame_right);
            }
            if (!barrier.left) {
                var flame_left = game.add.sprite(0, 0, 'flames', 34);
                flame_left.position.x = -SPACE.Y;
                flame_left.animations
                    .add('explosion', [4, 5, 6, 7, 6, 5, 4], 10, false)
                    .play();

                bomb.add(flame_left);
            }
            if (!barrier.up) {
                var flame_up = game.add.sprite(0, 0, 'flames', 34);
                flame_up.position.y = -SPACE.Y;
                flame_up.animations
                    .add('explosion', [12, 13, 14, 15, 14, 13, 12], 10, false)
                    .play();

                bomb.add(flame_up);
            }
            if (!barrier.down) {
                var flame_down = game.add.sprite(0, 0, 'flames', 34);
                flame_down.position.y = SPACE.Y;
                flame_down.animations
                    .add('explosion', [24, 25, 26, 27, 26, 25, 24], 10, false)
                    .play();
                bomb.add(flame_down);
            }

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