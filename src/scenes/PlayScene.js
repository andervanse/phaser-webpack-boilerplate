import Phaser from 'phaser';
import Player from '../entities/Player';

import Enemies from '../groups/Enemies';

class PlayScene extends Phaser.Scene {

    constructor(config) {
        super('PlayScene');
        this.config = config;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
    }

    create() {
        const map = this.createMap();
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);

        const player = this.createPlayer(playerZones.start);
        this.createPlayerColliderds(player, {
            colliders: {
                platformsColliders: layers.platformsColliders
            }
        });        

        const enemies = this.createEnemies(layers.enemySpawns, layers.platformsColliders);
        this.createEnemiesColliderds(enemies, {
            colliders: {
                platformsColliders: layers.platformsColliders,
                player: player
            }
        });

        this.createEndOfLevel(playerZones.end, player);
        this.setupFollowupCameraOn(player);
    }

    finishDrawing(pointer, layer) {
        this.line.x2 = pointer.worldX;
        this.line.y2 = pointer.worldY;

        this.graphics.clear();
        this.graphics.strokeLineShape(this.line);
        
        this.tileHits = layer.getTilesWithinShape(this.line);

        if (this.tileHits.length > 0) {
            this.tileHits.forEach(tile => {
                tile.index !== -1 && tile.setCollision(true)
            })
        }

        this.drawDebug(layer);
        this.plotting = false;
    }
    

    createMap() {
        const map = this.make.tilemap({ key: 'map' });
        map.addTilesetImage('main_lev_build_1', 'tiles-1');
        return map;
    }

    createLayers(map) {
        const tileset = map.getTileset('main_lev_build_1');
        const platformsColliders = map.createStaticLayer('platform_colliders', tileset);
        const environment = map.createStaticLayer('environment', tileset);
        const platforms = map.createStaticLayer('platforms', tileset);        
        const playerZones = map.getObjectLayer('player_zones');
        const enemySpawns = map.getObjectLayer('enemy_spawns');

        platformsColliders.setCollisionByProperty({ collides: true });

        return { environment, platforms, platformsColliders, playerZones, enemySpawns };
    }

    createPlayer(start) {
        return new Player(this, start.x, start.y);
    }

    createPlayerColliderds(player, { colliders }) {
        player.addCollider(colliders.platformsColliders);
    }

    setupFollowupCameraOn(player) {
        const { height, width, mapOffset } = this.config;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
        this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(this.config.zoomFactor);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(playerZonesLayer) {
        const playerZones = playerZonesLayer.objects;
        return {
            start: playerZones.find(zone => zone.name === 'startZone'),
            end: playerZones.find(zone => zone.name === 'endZone')
        }
    }

    createEndOfLevel(end, player) {

        const endOfLevel = this.physics.add.sprite(end.x, end.y, 'end')
            .setAlpha(0)
            .setSize(5, this.config.height)
            .setOrigin(0.5, 1);

        const eolOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            eolOverlap.active = false;
        });
    }

    createEnemies(spawnLayer, platformsColliders) {
        const enemies = new Enemies(this);
        const enemyTypes = enemies.getTypes();

        spawnLayer.objects.forEach((spawnPoint, i) => { 
            
            const enemy = new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
            enemy.setPlatformColliders(platformsColliders);
            enemies.add(enemy);
        });

        return enemies;
    }

    onPlayerCollision(enemy, player) {
        player.takesHit(enemy);
    }

    createEnemiesColliderds(enemies, { colliders }) {

        enemies
            .addCollider(colliders.platformsColliders)
            .addCollider(colliders.player, this.onPlayerCollision);
    }

}

export default PlayScene;