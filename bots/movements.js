var player_x = getMapX(player.pp.body.x);
            var player_y = getMapX(player.pp.body.y);
            var desired_x = newAction.x * SPACE.X;
            var desired_y = newAction.y * SPACE.Y;
            var spread = 2;


            var distance_x = desired_x - player.pp.body.x;
            var distance_y = desired_y - player.pp.body.y;
            console.log('distance_x', distance_x, 'distance_y', distance_y);

            var allowMoveX = ( (distance_x > 0 && !MAP[player_y][player_x + 1]) ||
                               (distance_x < 0 && !MAP[player_y][player_x - 1]) )
                             && 
                             ( (Math.abs(distance_x) >= SPACE.X) ||
                               Math.abs(distance_y) <= SPACE.Y);


            var allowMoveY = ( (distance_y > 0 && !MAP[player_y + 1][player_x]) ||
                               (distance_y < 0 && !MAP[player_y - 1][player_x]) )
                             && 
                            ( (Math.abs(distance_y) >= SPACE.Y) ||
                               Math.abs(distance_x) <= SPACE.X);                             

            if ((desired_x !== player.pp.body.x) && allowMoveX) {
                if (distance_x > spread) {
                    player.pp.body.velocity.x = 150;
                    player.pp.animations.play('right');
                }
                else if (distance_x < -spread) {
                    player.pp.body.velocity.x = -150;
                    player.pp.animations.play('left');
                }
                else {
                    player.pp.body.x = desired_x;
                }
            }
            else if (desired_y !== player.pp.body.y && allowMoveY) {
                if (distance_y > spread) {
                    player.pp.body.velocity.y = 150;
                    player.pp.animations.play('down');
                }
                else if (distance_y < -spread) {
                    player.pp.body.velocity.y = -150;
                    player.pp.animations.play('up');
                }
                else {
                    player.pp.body.y = desired_y;
                }
            }
            else {
                player.pp.animations.stop();
                player.pp.frame = 4;
            }









            var route = [ [2,2], [2,6], [4,4], [8,0], [8,6] ];
    function getPlayerAction0(state, x, y, MAP) {
        if(state.lastpoint === undefined){
            state.lastpoint = 0;
        }

        var sx = route[state.lastpoint][0];
        var sy = route[state.lastpoint][1];


        var result = {
            x: route[state.lastpoint][0],
            y: route[state.lastpoint][1],
            setBomb: (Math.random() < 0.001)
        };

        if(x == sx && y == sy){
            state.lastpoint = (Math.round(Math.random()*100))%route.length;
        }

        return result ;

        if(x >= 2 && y >= 4){
            return{
                x: 6,
                y: 5
            }
        }
        return {
            // setBomb: (++bomb % 10 == 0),
            x: 2,
            y: 4
        };
    }