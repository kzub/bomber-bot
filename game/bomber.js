var BOMBING_INTERVAL = 2000;
var WALL = W = 100;
var PLAYER_SPEED = 150;
var BOMB_EXPOLDE = 1700
var BOMB_EXPLOSION_FINISH = 2400;
var TEXT_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.()_?_!-  0123456789  +-*/_=';
var MAP = [
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    // [W,0,W,W,W,0,W,W,W,0,W,W,W,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,W,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]
];

var SPACE = {
    X: 60,
    Y: 60,
    XL: 6,
    XR: 54,
    YU: 6,
    YD: 54
};

function getReadOnlyProxy(object, text) {
    return new Proxy(object, {
        get: function(target, name){
            return target[name];
        },
        set: function(obj, prop, value) {
            throw text;
        }
    });
}

function makeBomb (player, map) {
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

function killPlayer(player){
    if(player.dead){
        return;
    }

    player.animations
        .play('die')
        .onComplete.add(function () {
            player.kill();
        });

    player.game.sound.add('hurt').play();
    player.dead = true;
}

function touchingBomb(player, sprite) {
    if(sprite.key == 'flames'){
        killPlayer(player);
    }
}

function getRandomBrickNum() {
    var walls = [1, 2, 3, 8, 9, 10, 11, 16, 17, 18, 19, 24, 25, 26, 27];
    return walls[ Math.floor(Math.random()*(walls.length - 1)) ];
}

function makeBricks(game) {
    var bricks = new Phaser.Group(game);

    for (var Y in MAP){
        for (var X in MAP[Y]){
            if(MAP[Y][X] === WALL){
                bricks.add(
                    game.add.sprite(
                        X*SPACE.X,
                        Y*SPACE.Y,
                        'bricks',
                        getRandomBrickNum()
                    )
                );
            }
        }
    }

    game.physics.arcade.enable(bricks);
    bricks.setAll('body.immovable', true);
    return bricks;
};

var TINTS = [0x77FFFF, 0xFFFF77, 0x77FF77, 0xFF7777, 0x7777FF, 0xFF77FF, 0xFFFFFF];
var TINTS_COUNTER = 0;
function Player(id, game, x, y, controller){
    var phaserPlayer = game.add.sprite(x * SPACE.X, y * SPACE.Y, 'dude', 4);
    game.physics.arcade.enable(phaserPlayer);
    phaserPlayer.body.collideWorldBounds = true;

    phaserPlayer.animations.add('left', [0, 1, 2],  10, true);
    phaserPlayer.animations.add('right',[9, 10, 11],10, true);
    phaserPlayer.animations.add('up',   [6, 7, 8],  10, true);
    phaserPlayer.animations.add('down', [3, 4, 5],  10, true);
    phaserPlayer.animations.add('die',  [12, 13, 14, 15 ,16, 17, 18], 10, false);
    phaserPlayer.tint = TINTS[TINTS_COUNTER++%TINTS.length];

    var self = this;
    // pubblic data
    self.id = id;
    self.type = 'player';
    self.x = x;
    self.y = y;
    self.lastAction = 'stop';
    self.nextBombTime = 0;
    // visualization object
    self.pp = phaserPlayer;
    // object that store bot's internal data
    self.state = new (function PlayerInternalState(){})();
    // public data readonly accessor
    self.info = new Proxy(self, {
        get: function(target, name){
            if (['id', 'type', 'x', 'y', 'lastAction', 'nextBombTime'].indexOf(name) === -1) {
                    return;
            }
            return self[name];
        },
        set: function(obj, prop, value) {
            throw 'Player object modification is forbidden';
        }
    });
    // map readonly accessor
    self.map = function(x, y) {
        if(MAP[y] === undefined){ return WALL; }
        if(MAP[y][x] === undefined){ return WALL; }
        return MAP[y][x];
    };
    // constants
    self.map.wall = WALL;
    self.map.width = MAP[0].length;
    self.map.height = MAP.length;
    self.map.bombInterval = BOMBING_INTERVAL;
    self.map.bombExpode = BOMB_EXPOLDE;
    self.map.bombVanish = BOMB_EXPLOSION_FINISH;
    self.map.playerSpeed = PLAYER_SPEED;
    // bot logic implementation
    self.controller = controller;
    // bot info
    self.name = "bot";
    self.stepTime = 0;
    self.stepCount = 0;
};


window.onload = function() {
    var width  = (MAP[0].length) * SPACE.X;
    var height = (MAP.length) * SPACE.Y;
    var game   = new Phaser.Game(width, height, Phaser.AUTO, 'game',
                     { preload: preload, create: create, update: update });

    var info   = new Phaser.Game(300, height, Phaser.AUTO, 'info',
                     { preload: info_preload, create: info_create, update: info_update });

    // debug [do not use it]:
    destroy = function (){
        game.destroy();
    }
    glob_game = game;
    
    var playerCount = 0;
    function addPlayer(name) {
        if (!window[name]) {
            console.log('not bot with name:', name);
            return;
        }

        var plr = new Player(playerCount, game,
                             spawn_points[playerCount%spawn_points.length][0],
                             spawn_points[playerCount%spawn_points.length][1],
                             window[name]);

        players.push(plr);
        map_objects_unsafe.push(plr.info);
        playerCount++;
    }

    window.addPlayer = addPlayer;

    // a=document.getElementById('script');    
    // a.onchange = function () {
    //     console.log(a.value);
    //     var script = document.createElement("script");
    //     script.innerHTML = a.value;
    //     document.head.appendChild(script);
    // }

    // var font;
    var cursors;
    var player;
    var pause = 0;
    var players = [];
    var pp_bombs = [];
    var pp_bricks;
    var map_objects_unsafe = []; // object with write access
    // readonly proxy object
    var map_objects = getReadOnlyProxy(map_objects_unsafe, 'Map objects modifications are forbidden');

    var spawn_points = [
        [1,1], 
        [MAP[0].length - 2, 1],
        [1, MAP.length - 2],
        [MAP[0].length - 2, MAP.length - 2],
        [3,3],
        [MAP[0].length - 4, 3],
        [3, MAP.length - 4],
        [MAP[0].length - 4, MAP.length - 4],
    ];

    function info_preload () {
        info.load.image('font', '/bomberman/sprites/font_white3.png');
    }

    function preload () {
        game.load.spritesheet('dude', '/bomberman/sprites/bomberman.png', 40, 60);
        game.load.spritesheet('bomb', '/bomberman/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('flames', '/bomberman/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('bricks', '/bomberman/sprites/bricks.png', 60, 60);
        game.load.audiosprite('explode', '/bomberman/sounds/explosion_15.mp3');
        game.load.audiosprite('hurt', '/bomberman/sounds/hurt1.mp3');
        game.load.image('font', '/bomberman/sprites/font_white3.png');
    }

    function info_create() {
        font = info.add.retroFont('font', 32, 30, TEXT_SET, 6, 0, 0);
        var i = info.add.image(0, 0 /*info.world.centerY*/, font);
        i.tint = Math.random() * 0xFFFFFF;
        font.text = 'Hello mam';
        // i.anchor.set(0.5, 1);
    }

    function create () {
        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKeys({ space: Phaser.KeyCode.SPACEBAR}).space;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        pp_bricks = makeBricks(game);

        for(var i = 0; i < 2; i++) {
            // addPlayer('zkBot');
        }
        
        // debug [do not use it]:
        p = players;
        pp = map_objects_unsafe;
        // game.paused = true;
    }

    function updatePlayer(player) {
        game.physics.arcade.collide(player.pp, pp_bricks);
        game.physics.arcade.overlap(player.pp, pp_bombs, touchingBomb);

        // run once
        if(player.pp.dead){
            player.pp.body.velocity.x = 0;
            player.pp.body.velocity.y = 0;
            return;
        }

        player.x = player.pp.body.x / SPACE.X;
        player.y = player.pp.body.y / SPACE.Y;

        var stepTime = Date.now();

        try {
            var newAction = player.controller(
                            player.info,
                            player.state,
                            player.map,
                            map_objects
                        );
        }
        catch(e) {
            console.log('Player throw error:', e);
            player.pp.body.velocity.x = 0;
            player.pp.body.velocity.y = 0;
            player.pp.animations.stop();
            killPlayer(player.pp);
            return;
        }

        player.stepTime += (Date.now() - stepTime);
        player.stepCount++;

        if (!newAction || newAction === 'stop') {
            player.pp.body.velocity.x = 0;
            player.pp.body.velocity.y = 0;
            player.pp.animations.stop();
            player.pp.frame = 4;
            player.lastAction = newAction;
            return;
        }

        if (newAction == 'bomb') {
            if(Date.now() > player.nextBombTime) {
                var bomb = makeBomb(player);
                map_objects_unsafe.push(bomb.info);
                pp_bombs.push(bomb.group);
                player.nextBombTime = Date.now() + BOMBING_INTERVAL;
            }
            return;
        }

        // finish movement before direction change
        var xcelldiff = player.pp.body.x % SPACE.X;
        var ycelldiff = player.pp.body.y % SPACE.Y;

        if (player.lastAction === 'left' && (newAction === 'up' || newAction === 'down')) {
            if (xcelldiff > 0) {
                if (xcelldiff > SPACE.XL) {
                    return;
                } else {
                    player.pp.body.x -= xcelldiff;
                }
            }
        }
        else if (player.lastAction === 'right' && (newAction === 'up' || newAction === 'down')) {
            if (xcelldiff > 0) {
                if (xcelldiff < SPACE.XR) {
                    return;
                } else {
                    player.pp.body.x += xcelldiff;
                }
            }
        }
        else if (player.lastAction === 'up' && (newAction === 'left' || newAction === 'right')) {
            if (ycelldiff > 0) {
                if (ycelldiff > SPACE.YU) {
                    return;
                } else {
                    player.pp.body.y -= ycelldiff;
                }
            }
        }
        else if (player.lastAction === 'down' && (newAction === 'left' || newAction === 'right')) {
            if (ycelldiff > 0) {
                if (ycelldiff < SPACE.YD) {
                    return;
                } else {
                    player.pp.body.y += ycelldiff;
                }
            }
        }

        //  Reset the players velocity (movement)
        player.pp.body.velocity.x = 0;
        player.pp.body.velocity.y = 0;

        if (newAction === 'right') {
            player.pp.body.velocity.x = PLAYER_SPEED;
            player.pp.animations.play('right');
        }
        else if (newAction === 'left') {
            player.pp.body.velocity.x = -PLAYER_SPEED;
            player.pp.animations.play('left');
        }
        else if (newAction === 'down') {
            player.pp.body.velocity.y = PLAYER_SPEED;
            player.pp.animations.play('down');
        }
        else if (newAction === 'up') {
            player.pp.body.velocity.y = -PLAYER_SPEED;
            player.pp.animations.play('up');
        }
        else {
            player.pp.animations.stop();
            player.pp.frame = 4;
        }

        // direction change helper
        player.lastAction = newAction;
    }

    // TODO:
    // biger bombs after 60 sec
    // game finish
    // print timings
    setInterval(function() {
        var times = [];
        for (var p in players) {
            times.push(players[p].stepTime);
            players[p].stepTime = 0;
            players[p].stepCount = 0;
        }
        // document.getElementById('time').innerHTML = times.join(',');

        // font.text = "Alive:" + players.length;
    }, 1000);

    function info_update() {
        // font.tint = Math.random() * 0xFFFFFF;
    }

    function update () {
        if(players.length <= 1){
            game.paused = true;
            setTimeout(function gameRestart() {
                // game.paused = false;
                // addPlayer('zkBot');
                // addPlayer('zkBot');
                // addPlayer('zkBot');
            }, 500)
        }

        for (var idx in players) {
            var player = players[idx]
            updatePlayer(player);

            // remove dead players
            if (player.pp.dead) {
                players.splice(idx, 1);
                for (var id in map_objects_unsafe) {
                    if (map_objects_unsafe[id].type === 'player' &&
                        map_objects_unsafe[id].id == player.id) {
                            map_objects_unsafe.splice(id, 1);
                            break;
                    }
                }
            }
        }

        // remove exploded bombs
        for(var id in map_objects_unsafe){
            if (map_objects_unsafe[id].type === 'bomb' &&
               !map_objects_unsafe[id].exists) {
                    map_objects_unsafe.splice(id, 1);
            }
        }
    }

};
