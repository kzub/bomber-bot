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


    // functions
    function preload () {
        dashboard.load.image('font', TEXT.SPRITE_PATH);
    }

    function createFontInItem(item){
        item.font = dashboard.add.retroFont('font',
                          TEXT.LETTER_WIDTH, TEXT.LETTER_HEIGHT,
                          TEXT.SET, TEXT.LETTERS_IN_ROW, 0, 0);

        item.img = dashboard.add.image(0, SPACE_Y*row_count++, item.font);
        item.need_update = true;
    }

    function create() {
        for (var idx in items) {
            var item = items[idx];
            createFontInItem(item);
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
                // item.img.tint = Math.random() * 0xFFFFFF;
            }
        }
    }

    self.destroy = function() {
        dashboard.destroy();
    };

    self.print = function(text) {
        // if(!font){ return font; }
        // font.text = text;
    };

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
        for (var idx in items) {
            var item = items[idx];
            if(item.name === name){
                item.prefix = String(prefix);
                item.value = String(value);
                item.align = options && options.align;
                item.need_update = true;
                return;
            }
        }

        var new_item = {
            name: name,
            prefix: String(prefix),
            value: String(value),
            align: options && options.align
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