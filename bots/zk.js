(function isolation(){
    addBot({
        name: "zk",
        routine: zkBot
    });

    function makeBombMap(map, map_objects) {
        var bomb_map = {};

        for (var p in map_objects) {
            var bomb = map_objects[p];
            if (bomb.type === 'bomb' ) {
                bomb_map[bomb.x] = bomb_map[bomb.x] || {};
                bomb_map[bomb.x][bomb.y] = bomb.birth;
                let radius = bomb.radius;
                
                for(let bx = 1; bx <= radius; bx++){
                    let new_x = bomb.x + bx;
                    if(map(new_x, bomb.y) === WALL) {
                        break;
                    }
                    bomb_map[new_x] = bomb_map[new_x] || {};
                    bomb_map[new_x][bomb.y] = bomb.birth;
                }
                for(let bx = 1; bx <= radius; bx++){
                    let new_x = bomb.x - bx;
                    if(map(new_x, bomb.y) === WALL) {
                        break;
                    }
                    bomb_map[new_x] = bomb_map[new_x] || {};
                    bomb_map[new_x][bomb.y] = bomb.birth;
                }
                for(let by = 1; by <= radius; by++){
                    let new_y = bomb.y + by;
                    if(map(bomb.x, new_y) === WALL) {
                        break;
                    }
                    bomb_map[bomb.x][new_y] = bomb.birth;
                }
                for(let by = 1; by <= radius; by++){
                    let new_y = bomb.y - by;
                    if(map(bomb.x, new_y) === WALL) {
                        break;
                    }
                    bomb_map[bomb.x][new_y] = bomb.birth;
                }
            }
        }
        return bomb_map;
    }

    const totry = [
        [-1, 0], [0, -1], [1, 0], [0, 1]
    ];
    const toforbid = [
        "2", "3", "0", "1"
    ];

// debug
globaldots = [];
globaldots2 = [];

    function getPath(my_state, map, bomb_map, x, y, xd, yd) {
        let paths = [];
        let iterPath = function(x, y, iter, path, weight, forbid) {
            if (iter === undefined) {
                path = [];
                iter = 3;
                weight = 1;
            }
            path.push([x, y]);

            if (iter === 0) {
                paths.push([path, weight]);
                return;
            }

            for (let step in totry) {
                let new_x = x + totry[step][0];
                let new_y = y + totry[step][1];
                let new_w = weight;
                if(map(new_x, new_y) === WALL){
                    continue;
                }
                if(step === forbid) {
                    continue;
                }
                if (bomb_map[new_x] && bomb_map[new_x][new_y]) {
                    new_w += bomb_map[new_x][new_y];
                }
                new_w += Math.abs(new_x - xd) + Math.abs(new_y - yd);
                iterPath(new_x, new_y, iter - 1, path.slice(), new_w, toforbid[step]);
            }
        }

        iterPath(x, y); 

        paths.sort((a, b) => a[1] - b[1] /* by weight */);

        // if (0) {
        //     globaldots.forEach(p => p.destroy());
        //     globaldots = [];

        //     for (let i in paths) {
        //         let p = paths[i][0];
        //         // let s = p.map(e => e[0] + ',' + e[1]).join(' -> ');
        //         // console.log(s, paths[i][1]);
        //         let w = paths[i][1];
        //         let c;
        //         if (w < 20) c = 32;
        //         else if (w > 1000000) c = 35;
        //         else c = 33;
        //         for (let d in p) {
        //             let dot = p[d];
        //             let s = glob_game.add.sprite(dot[0]*SPACE.X, dot[1]*SPACE.Y, 'bomb', c);
        //             globaldots.push(s);
        //         }
        //     }
        // }    
        // if (1) {
        //     globaldots.forEach(p => p.destroy());
        //     globaldots = [];
        //     let p =paths[0][0]; 
        //     for (let d in p) {
        //         let dot = p[d];
        //         let s = glob_game.add.sprite(dot[0]*SPACE.X, dot[1]*SPACE.Y, 'bomb', 32);
        //         globaldots.push(s);
        //     }            
        // }

        // return first step
        return paths[0][0][1];
    }


    function zkBot(my_info, my_state, map, map_objects, cursors) {
        var x = Math.floor(my_info.x);
        var y = Math.floor(my_info.y);
        var bombInterval = my_info.bombInterval + 5;
        var mapWidth = map.width;
        var mapHeight = map.height;

        var there_is_a_bomb;
        var target = {
            x: +Infinity, 
            y: +Infinity,
            w: +Infinity
        }

        for (var p in map_objects) {
            var object = map_objects[p];
            if (object.type === 'player' ) {
                if (object.id === my_info.id) {
                    continue; // myself
                }

                let xdiff = Math.abs(object.x - my_info.x);
                let ydiff = Math.abs(object.y - my_info.y);
                let weight = xdiff + ydiff;

                if (weight < target.w) {
                    target.w = weight;
                    target.x = object.x;
                    target.y = object.y; 
                }
            }
            else if (object.type === 'bomb') {
                there_is_a_bomb = true;
            }
        }

        if (!my_state.bomb || my_state.bomb < Date.now()) {
            let eq_x = Math.floor(target.x) === Math.floor(my_info.x);
            let eq_y = Math.floor(target.y) === Math.floor(my_info.y);
            let xdiff = Math.floor(Math.abs(target.x - my_info.x));
            let ydiff = Math.floor(Math.abs(target.y - my_info.y));

            if (xdiff <= my_info.bombRadius && eq_y) {
                my_state.bomb = Date.now() + bombInterval * (1 + Math.round());
                return 'bomb';
            } 
            else if (ydiff <= my_info.bombRadius && eq_x) {
                my_state.bomb = Date.now() + bombInterval * (1 + Math.round());
                return 'bomb';
            }
        }

        if (!my_state.repath || my_state.repath < Date.now()) {
            my_state.repath = Date.now() + 10;
            let bomb_map = {};
            if(there_is_a_bomb){
                bomb_map = makeBombMap(map, map_objects);
                if (1) {
                    globaldots2.forEach(d => d.destroy());
                    globaldots2 = [];
                    for (let bx in bomb_map) {
                        for (let by in bomb_map[bx]) {
                            globaldots2.push(
                                glob_game.add.sprite(bx*SPACE.X, by*SPACE.Y, 'bomb', 35)
                            );                    
                        }
                    }                    
                }
            }

            let nextStep = getPath(my_state, map, bomb_map, x, y, target.x, target.y);
            if (my_state.x === undefined || my_state.x != nextStep[0] || my_state.y != nextStep[1]) {
                my_state.x = nextStep[0];
                my_state.y = nextStep[1];
            }
        }

        var distance_x = my_state.x - my_info.x;
        var distance_y = my_state.y - my_info.y;

        if (x == Math.floor(target.x) && y == Math.floor(target.y)) {
            // return 'stop';
        }

        if (!my_state.y_priority && distance_x > 0) {
            if (map(x + 1, y) > 0) {
                if (map(x, y + 1) <= 0) {
                    return 'down';
                }
                else {
                    return 'up';
                }
            }
            return 'right';
        }
        else if (!my_state.y_priority && distance_x < 0) {
            if (map(x - 1, y) > 0) {
                if (map(x, y + 1) <= 0) {
                    return 'down';
                }
                else {
                    return 'up';
                }
            }
            return 'left';
        }
        else if (distance_y < 0) {
            if (map(x, y - 1) > 0) {
                if (map(x + 1, y) <= 0) {
                    my_state.y_priority = true;
                    return 'right';
                }
                else {
                    my_state.y_priority = true;
                    return 'left';
                }
            }
            return 'up';
        }
        else if (distance_y > 0) {
            if (map(x, y + 1) > 0) {
                if (map(x + 1, y) <= 0) {
                    my_state.y_priority = true;
                    return 'right';
                }
                else {
                    my_state.y_priority = true;
                    return 'left';
                }
            }
            return 'down';
        }
        else if (distance_x > 0) {
            my_state.y_priority = false;
            return 'right';
        }
        else if (distance_x < 0) {
            my_state.y_priority = false;
            return 'left';
        }
        else {
            my_state.y_priority = false;
        }

        return 'stop';
    }
})();