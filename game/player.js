const getTint = SequencedArray(TINTS);
const Player = function (name, controller, id, game, x, y) {
  var phaserPlayer = game.add.sprite(x * SPACE.X, y * SPACE.Y, 'dude', 4);
  game.physics.arcade.enable(phaserPlayer);
  phaserPlayer.body.collideWorldBounds = true;

  phaserPlayer.body.width = SPACE.X;
  phaserPlayer.body.height = SPACE.Y;
  // phaserPlayer.body.offset.x = -10;

  phaserPlayer.animations.add('left', [0, 1, 2],  10, true);
  phaserPlayer.animations.add('right',[9, 10, 11],10, true);
  phaserPlayer.animations.add('up',   [6, 7, 8],  10, true);
  phaserPlayer.animations.add('down', [3, 4, 5],  10, true);
  phaserPlayer.animations.add('die',  [12, 13, 14, 15 ,16, 17, 18], 10, false);
  phaserPlayer.tint = getTint();

  function PlayerInternalState(){}

  var self = this;
  // pubblic data
  self.id = id;
  self.name = name;
  self.type = 'player';
  self.x = x;
  self.y = y;
  self.lastAction = 'stop';
  self.nextBombTime = 0;
  self.bombRadius = 1;
  self.wins = 0;
  self.bombInterval = BOMBING_INTERVAL;
  self.speed = PLAYER_DEFAULT_SPEED;

  // visualization object
  self.pp = phaserPlayer;
  // object that store bot's internal data
  self.state = new PlayerInternalState();
  // public data readonly accessor
  self.info = new Proxy(self, {
      get: function(target, name){
          if (['id', 'type', 'x', 'y', 'lastAction', 'nextBombTime',
              'bombInterval', 'bombRadius', 'speed'].indexOf(name) === -1) {
                return;
          }
          return self[name];
      },
      set: function(obj, prop, value) {
          throw 'Player object modification is forbidden';
      }
  });
  // map readonly accessor
  self.map = function(x, y) {
      if(MAP[y] === undefined){ return WALL; }
      if(MAP[y][x] === undefined){ return WALL; }
      return MAP[y][x];
  };
  // constants
  self.map.wall = WALL;
  self.map.width = MAP[0].length;
  self.map.height = MAP.length;
  self.map.bombExpode = BOMB_EXPOLDE;
  self.map.bombVanish = BOMB_EXPLOSION_FINISH;
  // bot logic implementation
  self.controller = controller;
};

const killPlayer = function (player) {
  if(player.dead){
      return;
  }

  player.animations
      .play('die')
      .onComplete.add(function () {
          player.kill();
      });

  player.game.sound.add('hurt').play();
  player.dead = true;
};

const removePlayer = function (player) {
  if(player.dead){
      return;
  }
  player.dead = true;
  player.kill();
};

const PlayersList = function () {
  var self = this;
  var list = [];

  Object.defineProperty(self, "add",
    { value: add, writable: false, enumerable: true, configurable: true });
  Object.defineProperty(self, "iterator",
    { value: iterator, writable: false, enumerable: true, configurable: true });

  function add(obj) {
    if (!obj || !obj.name || !obj.routine) {
      console.error('wrong bot format');
      return;
    }

    obj.name = obj.name.slice(0, 7);

    if (list.filter(b => b.name === obj.name).length) {
      console.error('bot with this name already exists');
      return;
    }

    list.push(obj);
  }

  function Getter() {
    var counter = 0;
    return function () {
      return list[counter++];
    };
  }

  function iterator() {
    return new Getter();
  }
};


