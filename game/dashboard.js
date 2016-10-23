// constants
const TEXT = {
    SET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.()_?_!-  0123456789  +-*/_=',
    SPRITE_PATH: '/bomberman/sprites/font_white3.png',
    LETTER_WIDTH: 32,
    LETTER_HEIGHT: 30,
    LETTERS_IN_ROW: 6
};

const Dashboard = function(width, height, target) {
    var self = this;
    // game object
    var dashboard = new Phaser.Game(width, height, Phaser.AUTO, target,
                   { preload: preload, create: create, update: update });

    var items = [
        {
            name: "time",
            value: "00-00"
        },
        {
            name: "bomb_radius",
            prefix: "BR",
            value: "1",
            align: "right"
        },
        {
            name: "separator",
            value: "---------"
        },
    ];

    var SPACE_Y = 60;
    var row_count = 0;
    var default_items = items.length;
    var buttonListeners = [];


    // functions
    function preload () {
        dashboard.load.image('font', TEXT.SPRITE_PATH);
        dashboard.load.spritesheet('btnAddBot', 'sprites/buttons_add.png', 200, 50);
        dashboard.load.spritesheet('btnGo', 'sprites/buttons_go.png', 200, 50);
    }

    function create() {
        for (var idx in items) {
            var item = items[idx];
            createFontInItem(item);
        }
        dashboard.add.button(50, height - 170, 'btnAddBot', actionOnClick, this, 1, 0, 2);
        dashboard.add.button(50, height - 100, 'btnGo', actionOnClick, this, 1, 0, 2);
    }

    function createFontInItem(item) {
        item.font = dashboard.add.retroFont('font',
                          TEXT.LETTER_WIDTH, TEXT.LETTER_HEIGHT,
                          TEXT.SET, TEXT.LETTERS_IN_ROW, 0, 0);

        item.img = dashboard.add.image(0, SPACE_Y*row_count++, item.font);
        item.need_update = true;
    }

    function actionOnClick(item) {
        for (var i in buttonListeners) {
            if (item.key == buttonListeners[i].key) {
                buttonListeners[i].func();
            }
        }
    }

    function update() {
        for (var idx in items) {
            var item = items[idx];
            if (item.need_update) {
                item.need_update = false;
                var prefix = item.prefix ? String(item.prefix) : "";
                var value = String(item.value);
                if (item.align === "right") {
                    for(var c = prefix.length + value.length; c < 9; c++){
                        prefix += " ";
                    }
                }
                item.font.text = prefix + value;
                if (item.tint) {
                    item.img.tint = item.tint;
                }
            }
        }
    }

    self.destroy = function() {
        dashboard.destroy();
    };

    self.addButtonListener = function(key, func){
        if (typeof func === 'function') {
            buttonListeners.push({key: key, func: func});
        }
    }

    self.setItem = function(name, value) {
        for (var idx in items) {
            var item = items[idx];
            if (item.name === name) {
                item.value = value;
                item.need_update = true;
                return;
            }
        }
    };

    self.addItem = function(name, prefix, value, options) {
        // update existing
        for (var idx in items) {
            var item = items[idx];
            if(item.name === name){
                item.prefix = String(prefix);
                item.value = String(value);
                item.align = options && options.align;
                item.tint = options && options.tint;
                item.need_update = true;
                return;
            }
        }

        // add new
        var new_item = {
            name: name,
            prefix: String(prefix),
            value: String(value),
            align: options && options.align,
            tint: options && options.tint
        };
        createFontInItem(new_item);
        items.push(new_item);
    };

    self.pause = function() {
        setTimeout(function(){
            dashboard.paused = true;
        }, 100);
    };

    // self.d = dashboard;
};