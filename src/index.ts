import Phaser from 'phaser';
// Removing unused import
// import { MainScene } from './scenes/MainScene';
import { MenuScene } from './scenes/MenuScene';
import { BattleScene } from './scenes/BattleScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#333333',
  scene: [MenuScene, BattleScene, ResultScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

window.addEventListener('load', () => {
  // Create game instance - using underscore prefix to indicate intentionally unused variable
  // This suppresses the 'assigned but never used' warning
  const _game = new Phaser.Game(config);
});
