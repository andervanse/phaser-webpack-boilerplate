import Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import PreloadScene from './scenes/PreloadScene';

const MAP_WIDTH = 1600;
const WIDTH = document.body.offsetWidth;
const HEIGHT = 600;
const ZOOM_FACTOR = 1.5;

const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: ZOOM_FACTOR,
  debug: false,
  leftTopCorner : {
    x: (WIDTH - (WIDTH / ZOOM_FACTOR)) / 2,
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2
  },
  rightTopCorner : {
    x: (WIDTH / ZOOM_FACTOR) + ((WIDTH - (WIDTH / ZOOM_FACTOR)) / 2),
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2
  }
}

const Scenes = [PreloadScene, PlayScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: SHARED_CONFIG.debug
    }
  },  
  scene: initScenes()
}

new Phaser.Game(config);