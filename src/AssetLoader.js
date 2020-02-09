import bg from "./assets/bg.png";
import bike from "./assets/bike.png";
import floor from "./assets/floor.png";
import coin from "./assets/coin.png";
import bullet from "./assets/bullet.png";
import uiTop from "./assets/ui_top.png";
import enemy_1 from "./assets/enemy_1.png";
import enemy_2 from "./assets/enemy_2.png";
import asteroid from "./assets/asteroid.png";
import zombie from "./assets/zombie.png";
import boss_fly from "./assets/boss.png";
import explode from "./assets/explode.png";

export const loadAssets = (scene) => {
    scene.load.image("bg", bg);
    scene.load.image("bike", bike);
    scene.load.image("floor", floor);
    scene.load.image("coin", coin);
    scene.load.image("bullet", bullet);
    scene.load.image("uiTop", uiTop);
    scene.load.image("enemy_1", enemy_1);
    scene.load.image("enemy_2", enemy_2);
    scene.load.image("asteroid", asteroid);
    scene.load.image("zombie", zombie);
    scene.load.image("boss_fly", boss_fly);
    scene.load.spritesheet('explode',
        explode,
        { frameWidth: 96, frameHeight: 96 }
    );
}
