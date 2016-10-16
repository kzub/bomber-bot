(function isolation(){
    // добавить бота в список доступных ботов надо так:
    addBot({
        name: "keys",
        routine: keyboardBot
    });
    // Функция бота. Должна состоять из имени файла + слово Bot
    // На входе принимает данные о карте и других ботах/элементах
    // На выкоде команда к действию тип <string>
    function keyboardBot(my_info, my_state, map, map_objects, cursors) {
        // my_info  - информация об этом боте
        // my_state - Object в котором можно хранить временные данные бота
        // map - информация о карте и некоторые константы
        // map_objects - информация о временных объектах на карте. Таких как игроки, бомбы, магичесие артефакты

        if (cursors.space.isDown) {
            return 'bomb';
        }
        else if (cursors.left.isDown) {
            return 'left';
        }
        else if (cursors.right.isDown) {
            return 'right';
        }
        else if (cursors.up.isDown) {
            return 'up';
        }
        else if (cursors.down.isDown) {
            return 'down';
        }

        // Бот может вернуть 6 действий строками
        // идти налево, направо, вверх, вниз, стоять, поставить бомбу.
        // left | right | up | down | stop | bomb
        return 'stop';
    }
})();