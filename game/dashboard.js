// constants
const TEXT = {
    SET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.()_?_!-  0123456789  +-*/_=',
    SPRITE_PATH: '/bomberman/sprites/font_white3.png',
    LETTER_WIDTH: 32,
    LETTER_HEIGHT: 30,
    LETTERS_IN_ROW: 6
};

const Dashboard = function(width, height, target) {
    // game object
    var dashboard = new Phaser.Game(width, height, Phaser.AUTO, target,
                   { preload: preload, create: create, update: update });

    // variables
    var font;
    var img;
    var text = 'AAAAAAAAA';
    var text_pos = 0;
    var self = this;

    // functions
    function preload () {
        dashboard.load.image('font', TEXT.SPRITE_PATH);
    }

    function create() {
        font = dashboard.add.retroFont('font', TEXT.LETTER_WIDTH, TEXT.LETTER_HEIGHT,
                                  TEXT.SET, TEXT.LETTERS_IN_ROW, 0, 0);
        
        img = dashboard.add.image(0, 0 /*dashboard.world.centerY*/, font);
        font.text = 'Hello man';
        // img.anchor.set(0.5, 1);
    }

    function update() {
        img.tint = Math.random() * 0xFFFFFF;
        text_pos = (text_pos+1)%TEXT.SET.length;
        symb = TEXT.SET[text_pos];
        var new_text = '';
        for(var c in text){
            new_text += symb;
        }
        font.text = new_text;
    }

    self.destroy = function() {
        dashboard.destroy();
    };
};