import 'phaser';
import title_bg from "../assets/bg.png";
import logo from "../assets/jam_logo.png";

class TitleScene extends Phaser.Scene {

    constructor() {
        super({key: 'TitleScene'});
    }

    preload() {
        this.load.image('title_bg', title_bg);
        this.load.image('logo', logo);
    }

    create() {
        this.add.image(0, 0, 'title_bg').setOrigin(0, 0);
        this.add.image(1280-147-40, 720-200-40, 'logo').setOrigin(0, 0);
        this.add.text(1280/2, 720/2, 'BIKE GAME', {fontFamily: '"Impact"', fontSize: 120}).setOrigin(0.5, 0.5);
        this.add.text(1280/2, 720/2+180, '[PRESS ANY KEY]', {fontFamily: '"Impact"', fontSize: 60}).setOrigin(0.5, 0.5);

        this.input.keyboard.on('keydown', (e) => {
            this.scene.start('GameScene');
        });
    }
}

export default TitleScene;
