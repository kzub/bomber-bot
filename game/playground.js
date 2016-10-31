(function isolation(){
    // var font;
    var cursors;
    var player;
    var pause = 0;
    var players = [];
    var pp_bombs = [];
    var map_objects_unsafe = []; // object with write access
    var pp_bricks;
    var map_objects = getReadOnlyProxy(map_objects_unsafe, 'Map objects modifications are forbidden');
    var availableBots = new PlayersList();
    var getSpawnPoint = SequencedArray(SPAWN_POINTS);
    var game;
    var dashboard;
    var updateDashboard;
    var updateDashboardId;
    var startTime = 0;
    var bomb_radius = 1;
    var round_over = false;
    var allow_bombing = true;
    var game_wins_to_finish = 3;
    var activePlayers = [];
    var bomb_max_radius = 13;
    var bomb_expand_after_seconds = 60;
    var bomb_expand_every_seconds = 10;

    // export readonly functions:
    Object.defineProperty(window, "addBot",
        { value: availableBots.add, writable: false, enumerable: true, configurable: true });
    Object.defineProperty(window, "injectBotScript",
        { value: injectBotScript, writable: false, enumerable: true, configurable: true });


    var addPlayers = function(activeplayer) {
        var it = availableBots.iterator();

        for(;;) {
            var bot = it();
            if (!bot) { break; }
            if (!bot.name) { console.error('No bot name specified'); break; }
            if (bot.name !== activeplayer.name) { continue; }

            var point = getSpawnPoint();
            var plr = new Player(bot.name, bot.routine, activeplayer.id,
                                 game, point[0], point[1]);

            plr.wins = activeplayer.wins;
            players.push(plr);
            map_objects_unsafe.push(plr.info);
            dashboard.addItem("player" + plr.id, plr.name, plr.wins, 
                { align: "right", tint: getTint(plr.id) });
        }
        // debug [do not use it]:
        p = players;
        m = map_objects_unsafe;
        b = pp_bombs;
    };

    function preload () {
        game.load.spritesheet('dude', '/sprites/bomberman.png', 40, 60);
        game.load.spritesheet('bomb', '/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('flames', '/sprites/bomb2.png', 60, 60);
        game.load.spritesheet('bricks', '/sprites/bricks.png', 60, 60);
        game.load.audiosprite('explode', '/sounds/explosion_15.mp3');
        game.load.audiosprite('hurt', '/sounds/hurt1.mp3');
    }

    function create () {
        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKeys({ space: Phaser.KeyCode.SPACEBAR}).space;

        game.physics.startSystem(Phaser.Physics.ARCADE);
        pp_bricks = makeBricks(game);

        game.paused = true;
        
        if (typeof autoStartBots !== 'undefined') {
            autoStartBots.forEach(b => {
                console.log('auto adding bot:', b.name);
                injectBotScript(b.name, b.filename);
            });
            setTimeout(onGoClick, 200);
        }
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

        // var stepTime = Date.now();
        var newAction;

        try {
            newAction = player.controller(
                            player.info,
                            player.state,
                            player.map,
                            map_objects,
                            cursors
                        );
            if(!newAction){
                return;
            }
        }
        catch(e) {
            console.log('Player', player.name, ' throw error:', e);
            player.pp.body.velocity.x = 0;
            player.pp.body.velocity.y = 0;
            player.pp.animations.stop();
            killPlayer(player.pp);
            return;
        }

        if (newAction == 'bomb' && allow_bombing) {
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

        if (player.lastAction === 'left') {
            if (!newAction || ~['up', 'down', 'stop'].indexOf(newAction)) {
                if (xcelldiff > SPACE.XL) {
                    return;
                } else {
                    player.pp.body.x = Math.floor(player.pp.body.x / SPACE.X) * SPACE.X;
                }
            }
        }
        else if (player.lastAction === 'right') {
            if (!newAction || ~['up', 'down', 'stop'].indexOf(newAction)) {
                if(xcelldiff){
                    if (xcelldiff < SPACE.XR) {
                        return;
                    } else {
                        player.pp.body.x = Math.ceil(player.pp.body.x / SPACE.X) * SPACE.X;
                    }
                }
            }
        }
        else if (player.lastAction === 'up') {
            if (!newAction || ~['left', 'right', 'stop'].indexOf(newAction)) {
                if (ycelldiff > SPACE.YU) {
                    return;
                } else {
                    player.pp.body.y = Math.floor(player.pp.body.y / SPACE.Y) * SPACE.Y;
                }
            }
        }
        else if (player.lastAction === 'down') {
            if (!newAction || ~['left', 'right', 'stop'].indexOf(newAction)) {
                if (ycelldiff) {
                    if (ycelldiff && ycelldiff < SPACE.YD) {
                        return;
                    } else {
                        player.pp.body.y = Math.ceil(player.pp.body.y / SPACE.Y) * SPACE.Y;
                    }
                }
            }
        }

        //  Reset the players velocity (movement)
        player.pp.body.velocity.x = 0;
        player.pp.body.velocity.y = 0;

        if (newAction === 'right') {
            player.pp.body.velocity.x = player.speed;
            player.pp.animations.play('right');
        }
        else if (newAction === 'left') {
            player.pp.body.velocity.x = -player.speed;
            player.pp.animations.play('left');
        }
        else if (newAction === 'down') {
            player.pp.body.velocity.y = player.speed;
            player.pp.animations.play('down');
        }
        else if (newAction === 'up') {
            player.pp.body.velocity.y = -player.speed;
            player.pp.animations.play('up');
        }
        else {
            player.pp.animations.stop();
            player.pp.frame = 4;
        }

        // direction change helper
        player.lastAction = newAction;
    }

    function stopPlayer(player) {
        player.pp.body.velocity.x = 0;
        player.pp.body.velocity.y = 0;
        player.pp.animations.stop();
        player.pp.frame = 4;
    }

    function gameRestart() {
        console.log('game restart');
        startTime = 0;
        resetBombRadius();

        if (!updateDashboardId) {
            updateDashboardId = setInterval(updateDashboard, 1000);
            updateDashboard();
        }

        players.forEach(p => removePlayer(p.pp));
        pp_bombs.forEach(b => b.callAll("kill"));
        players = [];
        pp_bombs = [];
        map_objects_unsafe = [];
        map_objects = getReadOnlyProxy(map_objects_unsafe, 'Map objects modifications are forbidden');

        activePlayers.forEach(ap => addPlayers(ap));
        round_over = false;
        allow_bombing = true;
    }

    function update () {
        if(players.length <= 1){
            if (round_over) {
                return;
            }
            allow_bombing = false;
            if(pp_bombs.length === 0) {
                var winner = players[0];
                if (winner) {
                    var apWinner = activePlayers.find(ap => ap.id === winner.id);
                    winner.wins = ++apWinner.wins;
                    dashboard.setItem('player' + winner.id, winner.wins);
                    stopPlayer(winner);
                }

                round_over = true;
                if (winner && winner.wins >= game_wins_to_finish) {
                    game.paused = true;
                    dashboard.pause();
                    return;
                }

                clearInterval(updateDashboardId);
                updateDashboardId = undefined;
                setTimeout(gameRestart, 1500);
                return;
            }
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
        for (var id in map_objects_unsafe) {
            if (map_objects_unsafe[id].type === 'bomb' &&
               !map_objects_unsafe[id].exists) {
                    map_objects_unsafe.splice(id, 1);
            }
        }
        for (var bid in pp_bombs) {
            if (!pp_bombs[bid].alive) {
                pp_bombs.splice(bid, 1);
            }
        }
    }

    function showScriptLoader(show){
        if (show === false) {
            document.getElementById('scriptloader').style.visibility = 'hidden';
        } else {
            document.getElementById('scriptloader').style.visibility = 'visible';
        }
    }

    function injectBotScript(name, filename) {
        var script = document.createElement("script");
        if (filename) {
            script.src = filename;
        } else {
            var text = document.getElementById('textScriptBody');
            script.innerHTML = text.value;
            showScriptLoader(false);
        }
        document.head.appendChild(script);

        // add as player after script loaded
        setTimeout(function() {
            var bot = filename ? availableBots.get(name) : availableBots.last();
            activePlayers.push({id: activePlayers.length, name: bot.name, wins: 0});
            addPlayers(activePlayers[activePlayers.length - 1]);
        }, 150);
    }

    function onGoClick() {
        if (game.paused) {
            updateDashboardId = setInterval(updateDashboard, 1000);
        }
        game.paused = false;
    }

    function resetBombRadius() {
        bomb_radius = 0;
        increaseBombRadius();
    }

    function increaseBombRadius() {
        bomb_radius++;
        dashboard.setItem('bomb_radius', bomb_radius);
        for (var p in players) {
            var player = players[p];
            if (player.bombRadius < bomb_radius) {
                player.bombRadius = bomb_radius;
            }
        }
    }

    updateDashboard = function() {
        startTime++;
        var minutes = Math.floor(startTime / 60);
        var seconds = startTime % 60;
        dashboard.setItem('time',
            [zeroPad(minutes, 2), zeroPad(seconds, 2)].join("-"));

        if(startTime >= bomb_expand_after_seconds &&
           startTime % bomb_expand_every_seconds === 0 &&
           bomb_radius < bomb_max_radius) {
                increaseBombRadius();
        }

        for (var pid in players) {
            dashboard.setItem('player' + players[pid].id, players[pid].wins);
        }
    };

    window.onload = function() {
        var width = (MAP[0].length) * SPACE.X;
        var height = (MAP.length) * SPACE.Y;

        game = new Phaser.Game(width, height, Phaser.AUTO,
                   'game', { preload: preload, create: create, update: update });

        dashboard = new Dashboard(width, height, dashboard);
        document.getElementById('btnScriptLoad').onclick = injectBotScript;
        document.getElementById('btnScriptCancel').onclick = function(){
            showScriptLoader(false);
        };

        // debug [do not use it]:
        glob_game = game;
        glob_dash = dashboard;
        window.destroy = function (){
            game.destroy();
            dashboard.destroy();
        };

        dashboard.addButtonListener('btnAddBot', showScriptLoader);
        dashboard.addButtonListener('btnGo', onGoClick);
    };
})();


