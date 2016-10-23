(function isolation(){
    // добавить бота в список доступных ботов надо так:
    addBot({
        name: "testbot",
        routine: testBot
    });

    // Функция бота.
    // На входе принимает данные о карте и других ботах/элементах
    // На выкоде команда к действию тип <string>
    function testBot(my_info, my_state, map, map_objects, cursors) {
        // my_info  - информация об этом боте
        // my_state - Object в котором можно хранить временные данные бота
        // map - информация о карте и некоторые константы
        // map_objects - информация о временных объектах на карте. Таких как игроки, бомбы, магичесие артефакты

        var x = Math.floor(my_info.x);
        var y = Math.floor(my_info.y);

        // my_info.type - типа == player
        // my_info.id - id игрока
        // my_info.x - координата на карте  в клетках
        // my_info.y - координата на карте  в клетках
        // my_info.lastAction - последнее известное действие
        // my_info.nextBombTime - timestamp когда сможет поставить следующую бомбу
        // my_info.speed - скорость игрока. в чем измеряется пока не понял))
        // my_info.bombInterval - как часто можно ставить бомбу

        // map.width - размерность карты в клетках
        // map.height - размерность карты в клетках
        // map.bombExpode - timestamp когда бомба взорвется;
        // map.bombVanish - timestamp когда бомба исчезнет после взрыва. можно проходить;

        for (var p in map_objects) {
            var object = map_objects[p];
            if (object.type === 'player' ) {
                if (object.id === my_info.id) {
                    continue; // myself
                }

                // you can use info about other players:
                // object.id
                // object.type
                // object.x
                // object.y
                // object.lastAction
                // object.nextBombTime
                // object.speed
                // object.bombInterval
            }
            else if (object.type === 'bomb') {
                // object.birth
                // object.exists
                // object.expode
                // object.owner
                // object.type
                // object.vanish
                // object.x
                // object.y
            }
        }

        //  bombs
        if (my_state.bomb === undefined || my_state.bomb < Date.now() ) {
            my_state.bomb = Date.now() + my_info.bombInterval;
            // return 'bomb';
        }

        // movements
        if(my_state.x === undefined || (my_state.x == x && my_state.y == y)){
            my_state.x = 1;
            my_state.y = 3;
        }

        var distance_x = my_state.x - x;
        var distance_y = my_state.y - y;

        if (distance_y < 0) {
            if (map(x, y - 1) === map.wall) { // check if element above a wall
                if (map(x - 1, y) === map.wall) {
                    return 'right';
                } else {
                    return 'left';
                }
            }
            return 'up';
        }
        else if (distance_y > 0) {
            if (map(x, y + 1) === map.wall) { // check if element below a wall
                if (map(x - 1, y) === map.wall) {
                    return 'right';
                } else {
                    return 'left';
                }
            }
            return 'down';
        }
        else if (distance_x > 0) {
            if (map(x + 1, y) === map.wall) { // check if element below a wall
                if (map(x, y - 1) === map.wall) {
                    return 'down';
                } else {
                    return 'up';
                }
            }
            return 'right';
        }
        else if (distance_x < 0) {
            if (map(x - 1, y) === map.wall) { // check if element below a wall
                if (map(x, y - 1) === map.wall) {
                    return 'down';
                } else {
                    return 'up';
                }
            }
            return 'left';
        }

        // Бот может вернуть 6 действий строками
        // идти налево, направо, вверх, вниз, стоять, поставить бомбу.
        // left | right | up | down | stop | bomb
        return 'stop';
    }
})();