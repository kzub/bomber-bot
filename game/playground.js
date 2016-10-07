window.onload = function() {
    var width = (MAP[0].length) * SPACE.X;
    var height = (MAP.length) * SPACE.Y;
    var game   = new Phaser.Game(width, height, Phaser.AUTO,
                                'game', { preload: preload, create: create, update: update });

    var dashboard = new Dashboard(width, height, dashboard);
    // debug [do not use it]:
    destroy = function (){
        dashboard.destroy();
        game.destroy();
    };
    glob_game = game;
    
    var playerCount = 0;
    const addPlayer = function(name) {
        if (!window[name]) {
            console.log('not bot with name:', name);
            return;
        }

        var point = getSequencedFromArray(SPAWN_POINTS);
        var plr = new Player(playerCount, game, point[0], point[1], window[name]);

        players.push(plr);
        map_objects_unsafe.push(plr.info);
        playerCount++;
    };


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
   
    function preload () {
        game.load.spritesheet('dude', '/bomberman/sprites/bomberman.png', 40, 60);
        game.load.spritesheet('bomb', '/bomberman/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('flames', '/bomberman/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('bricks', '/bomberman/sprites/bricks.png', 60, 60);
        game.load.audiosprite('explode', '/bomberman/sounds/explosion_15.mp3');
        game.load.audiosprite('hurt', '/bomberman/sounds/hurt1.mp3');
    }

    function create () {
        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKeys({ space: Phaser.KeyCode.SPACEBAR}).space;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        pp_bricks = makeBricks(game);

        for(var i = 0; i < 1; i++) {
            addPlayer('simpleBot');
        }

        addPlayer('keyboardBot');
        
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
        var newAction;

        try {
            newAction = player.controller(
                            player.info,
                            player.state,
                            player.map,
                            map_objects,
                            cursors
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
                if (xcelldiff > SPACE.XL) {
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
                if (ycelldiff > SPACE.YU) {
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
            player.pp.body.velocity.x = player.playerSpeed;
            player.pp.animations.play('right');
        }
        else if (newAction === 'left') {
            player.pp.body.velocity.x = -player.playerSpeed;
            player.pp.animations.play('left');
        }
        else if (newAction === 'down') {
            player.pp.body.velocity.y = player.playerSpeed;
            player.pp.animations.play('down');
        }
        else if (newAction === 'up') {
            player.pp.body.velocity.y = -player.playerSpeed;
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

    // setInterval(function() {
    //     var times = [];
    //     for (var p in players) {
    //         times.push(players[p].stepTime);
    //         players[p].stepTime = 0;
    //         players[p].stepCount = 0;
    //     }
    //     // document.getElementById('time').innerHTML = times.join(',');

    //     // font.text = "Alive:" + players.length;
    // }, 1000);


    function update () {
        if(players.length <= 1){
            game.paused = true;
            setTimeout(function gameRestart() {
                // game.paused = false;
                // addPlayer('zkBot');
                // addPlayer('zkBot');
                // addPlayer('zkBot');
            }, 500);
        }

        for (let idx in players) {
            var player = players[idx];
            updatePlayer(player);

            // remove dead players
            if (player.pp.dead) {
                players.splice(idx, 1);
                for (let id in map_objects_unsafe) {
                    if (map_objects_unsafe[id].type === 'player' &&
                        map_objects_unsafe[id].id == player.id) {
                            map_objects_unsafe.splice(id, 1);
                            break;
                    }
                }
            }
        }

        // remove exploded bombs
        for(let id in map_objects_unsafe){
            if (map_objects_unsafe[id].type === 'bomb' &&
               !map_objects_unsafe[id].exists) {
                    map_objects_unsafe.splice(id, 1);
            }
        }
    }

};
