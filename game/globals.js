const WALL = 100;
const W = WALL;
const MAP = [
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    // [W,0,W,W,W,0,W,W,W,0,W,W,W,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,0,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,W,W,W,0,0,W,0,0,0,W,0,0,W],
    // [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,0,W,0,W,0,W,0,W,0,W,0,W,0,W],
    [W,0,0,0,0,0,0,0,0,0,0,0,0,0,W],
    [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]
];

const SPACE = {
    X: 60,
    Y: 60,
    XL: 6,
    XR: 54,
    YU: 6,
    YD: 54
};

const SPAWN_POINTS = [
    [1,1],
    [MAP[0].length - 2, 1],
    [1, MAP.length - 2],
    [MAP[0].length - 2, MAP.length - 2],
    // [3,3],
    // [MAP[0].length - 5, 3],
    // [3, MAP.length - 5],
    // [MAP[0].length - 5, MAP.length - 5],
];

// const TINTS = [0x77FFFF, 0xFFFF77, 0x77FF77, 0xFF7777, 0x7777FF, 0xFF77FF, 0xFFFFFF];
const TINTS = [0xFFFFFF, 0xFF5555, 0x55FF55, 0x5555FF, 0x77FFFF, 0xFFFF77, 0x77FF77, 0xFF7777, 0x7777FF, 0xFF77FF];

const WALLS = [1, 2, 3, 8, 9, 10, 11, 16, 17, 18, 19, 24, 25, 26, 27];

const BOMBING_INTERVAL = 2500;
const PLAYER_DEFAULT_SPEED = 150;
const BOMB_EXPOLDE = 1700;
const BOMB_EXPLOSION_FINISH = 2400;
