import Phaser from 'phaser';
import initAnimations from './anims/playerAnims';
import collidable from '../mixins/collidable';
import HealthBar from '../hud/HealthBar';

class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
       super(scene, x, y, 'player');

       scene.add.existing(this);
       scene.physics.add.existing(this);

       // Mixins
       Object.assign(this, collidable);

       this.init();
       this.initEvents();
    }

    init() {        
        this.gravity = 500;
        this.playerSpeed = 100;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.hasBeenHit = false;
        this.bounceVelocity = 250;
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.health = 100;
        this.hp = new HealthBar(
            this.scene,            
            this.scene.config.leftTopCorner.x + 5,
            this.scene.config.leftTopCorner.y + 5,
            2,
            this.health
        );
        this.body.setSize(20, 38);
        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        initAnimations(this.scene.anims);
    }

    initEvents() {
       this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update() {
        if (this.hasBeenHit) { return; }
        const { left, right, space, up } = this.cursors;
        const onFloor = this.body.onFloor();
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);

        if (left.isDown) {
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        } else if (right.isDown) {
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        onFloor ? 
            (this.body.velocity.x !== 0) ?
                this.play('run', true) : this.play('idle', true) :
            this.play('jump', true);        

        if ((isSpaceJustDown) && (onFloor || this.jumpCount < this.consecutiveJumps)) {
            this.setVelocityY(-this.playerSpeed * 2.8);
            this.jumpCount++;
        }

        if (onFloor) {
            this.jumpCount = 0;
        }
    }

    playDamageTween() {
        return this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: -1,
            tint: 0xffffff
        });
    }

    bounceOff() {
        this.body.touching.right ? 
            this.setVelocity(-this.bounceVelocity, -this.bounceVelocity) :
            this.setVelocity(this.bounceVelocity, -this.bounceVelocity);

        setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
    }
    takesHit(initiator) {
        if (this.hasBeenHit) { return; }
        this.hasBeenHit = true;
        this.bounceOff();
        const hitAnim = this.playDamageTween();

        this.health -= initiator.damage;
        this.hp.decrease(this.health);

        this.scene.time.delayedCall(1500, () => { 
            this.hasBeenHit = false;
            hitAnim.stop();
            this.clearTint();
        });
    }


}

export default Player;