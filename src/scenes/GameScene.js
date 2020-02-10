import Phaser from "phaser";
import floor from "../assets/floor.png";
import bg from "../assets/bg.png";
import bike from "../assets/bike.png";
import coin from "../assets/coin.png";
import bullet from "../assets/bullet.png";
import uiTop from "../assets/ui_top.png";
import asteroid from "../assets/asteroid.png";
import boss_fly from "../assets/boss.png";
import {wave1} from "../WaveMaker";
import {enemyTypes} from "../EnemyTypes";
import {loadAssets} from "../AssetLoader";

class GameScene extends Phaser.Scene {

    cursors;
    player;
    platforms;
    coins;
    enemies;
    bullets;

    //UI
    scoreText;
    centerText;
    points = 0;
    bossHealth = 25;
    levelComplete = false;

    waveSectionIndex = 0;
    enemyBulletTimer;

    //Player props.
    jumpStarted = false;
    jumpBoosts = 1;
    hasShot = false;

    constructor() {
        super({key: 'GameScene'});
    }

    makeImage = (scene, x, y, key) => scene.add.image(x, y, key).setOrigin(0, 0);

    preload() {
        loadAssets(this);
    }

    createGroup = (scene, children) => scene.physics.add.group(children);

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        const bg = this.makeImage(this, 0, 0, "bg");
        const bg2 = this.makeImage(this, 1280, 0, "bg");
        const uiTop = this.makeImage(this, 0, 0, "uiTop");
        this.scoreText = this.add.text(40, 40, 'POINTS: 0', {fontFamily: '"Impact"', fontSize: 42});
        this.centerText = this.add.text(1280 / 2, 720 / 2, 'LEVEL COMPLETE', {
            fontFamily: '"Impact"',
            fontSize: 42
        }).setOrigin(0.5, 0);
        this.centerText.setAlpha(0);
        this.centerText.setDepth(100);

        //Physics groups
        this.bullets = this.createGroup(this,{velocityX: 700, allowGravity: false});
        this.coins = this.createGroup(this,{velocityX: -250, bounceY: 0.3});
        this.enemies = this.createGroup(this,{velocityX: -550, bounceY: 0.6});
        this.enemyBullets = this.createGroup(this,{velocityX: -450, bounceY: 0.85});

        this.player = this.physics.add.image(200, 400, "bike").setOrigin(0, 0);
        this.player.setBounce(0.3);
        this.player.setCollideWorldBounds(true);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(0, 630, 'floor').setOrigin(0, 0).setAlpha(0).refreshBody();
        this.platforms.create(1280, 630, 'floor').setOrigin(0, 0).setAlpha(0).refreshBody();

        var timer = this.time.addEvent({
            delay: 4000,
            callback: () => {
                if (this.waveSectionIndex >= wave1.length) {
                    timer.remove();
                } else {
                    const waveSection = wave1[this.waveSectionIndex];
                    const {stepX, stepY, yPos} = waveSection;
                    const xPos = waveSection.xPos || 1320;
                    const enemyType = enemyTypes.find(_ => _.key === waveSection.key);
                    const speed = enemyType.speed || 550;
                    const bounce = enemyType.bounce || 0.6;
                    const {key, allowGravity} = enemyType;

                    // for(let i = 0; i < waveSection.amount; i++) {
                    //     const enemy = this.physics.add.image(xPos, yPos, key);
                    //     enemy.allowGravity = allowGravity;
                    //     enemy.setBounceY(bounce);
                    //     enemy.setVelocityX(-speed);
                    //     this.enemies.add(enemy);
                    // }

                    if (key === 'boss_fly') {
                        this.enemyBulletTimer = this.time.addEvent({
                            delay: 3000,
                            callback: () => {
                                const bullet = this.physics.add.image(
                                    xPos+(-200+ (Math.floor(Math.random() * 100))),
                                    yPos+(-400+ (Math.floor(Math.random() * 200))),
                                    "asteroid");
                                this.enemyBullets.add(bullet);
                            },
                            callbackScope: this,
                            loop: true
                        });
                    }


                    this.enemies = this.physics.add.group({
                        key,
                        repeat: waveSection.amount - 1,
                        setXY: {x: xPos, y: yPos, stepX, stepY},
                        velocityX: -speed,
                        allowGravity,
                        bounceY: bounce,
                    });
                    this.physics.add.collider(this.enemies, this.platforms);
                    this.physics.add.overlap(this.bullets, this.enemies, this.killEnemy, null, this);
                    this.waveSectionIndex++;
                }
            },
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemyBullets, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.killEnemy, null, this);

        const bgTweenConfig = {
            useFrames: true,
            targets: bg,
            x: -1280,
            duration: 60,
            loop: -1
        };
        this.tweens.add(bgTweenConfig);
        this.tweens.add({...bgTweenConfig, targets: bg2, x: 0,});

        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explode', { start: 0, end: 36 }),
            frameRate: 20,
            repeat: 0,
        });
    }

    addExplosion = (x, y) => {
        let playerAnim = this.add.sprite(x, y, 'explosion', 1);
        playerAnim.play('explosion');
        var explodeTimer = this.time.addEvent({
            delay: 800,
            callback: () => {
                playerAnim.destroy();
                explodeTimer.remove();
            }
        });
    };

    collectCoin(player, coin) {
        coin.destroy();
        this.points++;
        this.scoreText.setText("POINTS: " + this.points);
    }

    killEnemy(bullet, enemy) {
        const hitBoss = enemy.texture.key === 'boss_fly';
        if (hitBoss && this.bossHealth > 0) {
            this.bossHealth--;
            bullet.destroy();
            console.log('>>>>', enemy.texture.key, this.bossHealth);
        } else {

            if (hitBoss) {
                this.enemyBulletTimer.remove();
                this.levelComplete = true;
                this.centerText.setAlpha(1);
            }

            bullet.destroy();

            const eX = enemy.body.x;
            const eY = enemy.body.y;
            enemy.destroy();
            this.addExplosion(eX, eY);
            //enemy.anims.play('explosion', true);

            this.points += 3;
            this.scoreText.setText("POINTS: " + this.points);

            if (hitBoss || Math.floor(Math.random() * 2) === 1) {
                for (let i = 0; i < (hitBoss ? 50 : 1); i++) {
                    const coin = this.physics.add.image(
                        eX + (Math.floor(Math.random() * 300)),
                        eY + (Math.floor(Math.random() * 300)),
                        "coin");
                    this.coins.add(coin);
                }
            }
        }
    }

    update(time, delta) {
        const playerBody = this.player.body;
        if (this.cursors.up.isDown && playerBody.touching.down && !this.jumpStarted) {
            this.player.setVelocityY(-300);
            this.jumpStarted = true;

        } else if (this.cursors.up.isDown && this.jumpStarted) {

            if (this.jumpBoosts < 28) {
                this.player.setVelocityY(playerBody.velocity.y - (180 / this.jumpBoosts));
                this.jumpBoosts++;
            }
        } else if (this.cursors.up.isUp) {
            this.jumpStarted = false;
            this.jumpBoosts = 1;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.space.isDown && !this.hasShot) {
            const bullet = this.physics.add.image(playerBody.x + 150, playerBody.y + 45, 'bullet');
            this.bullets.add(bullet);
            this.hasShot = true;
        } else if (this.cursors.space.isUp) {
            this.hasShot = false;
        }
    }
}

export default GameScene;
