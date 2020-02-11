import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import TitleScene from "./scenes/TitleScene";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1280,
  height: 720,
  scene: [TitleScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1050 },
      debug: true
    }
  },
};

const game = new Phaser.Game(config);
