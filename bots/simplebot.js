var route = function(map){
    return [ [1, 1], 
             [map.width - 2, 1], 
             [map.width - 2, map.height - 2],
             [1, map.height - 2]
    ][Math.floor(Math.random()*3.99)];
}

function dumpPlayer(my_info, my_state, map, map_objects) {
    var x = Math.floor(my_info.x);
    var y = Math.floor(my_info.y);
    var mapWidth = map.width;
    var mapHeight = map.height;
    var bombInterval = map.bombInterval;
    var myId = my_info.id;

    for (var p in map_objects) {
        var player = map_objects[p];
        if (player.type !== 'player' ) {
            continue; // not players (comming soon...)
        }
        if (player.id === myId) {
            continue; // myself
        }

        // you can use info about other players:
        console.log(player.id,
                    player.type,
                    player.x,
                    player.y,
                    player.lastAction, 
                    player.lastSetBomb);
    }

    //  bombs
    if (my_state.bomb === undefined || my_state.bomb < Date.now() ) {
        my_state.bomb = Date.now() + bombInterval;
        return 'bomb';
    }

    // movements
    if(my_state.x === undefined || (my_state.x == x && my_state.y == y)){
        var r = route(map); // choose point to go
        my_state.x = r[0];
        my_state.y = r[1];
    }

    var distance_x = my_state.x - x;
    var distance_y = my_state.y - y;

    if (distance_y < 0) {
        if (map(x, y - 1) === map.wall) { // check if element above a wall
            return 'down';
        }
        return 'up';
    }
    else if (distance_y > 0) {
        if (map(x, y + 1) === map.wall) { // check if element below a wall
            return 'up';
        }
        return 'down';
    }
    else if (distance_x > 0) {
        return 'right';
    }
    else if (distance_x < 0) {
        return 'left';
    }

    return 'stop';
}