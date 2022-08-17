import { Player } from "../data/player";
import GameScene from "../scenes/Game";

export class GamePlayer extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    player: Player;
    scene: GameScene;
    playerLabel: Phaser.GameObjects.Text;
    moneyLabel: Phaser.GameObjects.Text;
    livesLabel: Phaser.GameObjects.Text;
    incomeLabel: Phaser.GameObjects.Text;
    constructor(scene: GameScene, player: Player) {
        super(scene, 'GamePlayer');
        this.id = player.id;
        this.player = player;
        this.scene = scene;
        this.playerLabel = this.scene.add.text(this.scene.offsetX, 400 + this.scene.offsetY, "Player " + this.id);
        this.moneyLabel = this.scene.add.text(this.scene.offsetX, 420 + this.scene.offsetY, "Gold: " + this.player.money);
        this.livesLabel = this.scene.add.text(this.scene.offsetX, 440 + this.scene.offsetY, "Lives: " + this.player.lives);
        this.incomeLabel = this.scene.add.text(this.scene.offsetX, 460 + this.scene.offsetY, "Income: " + this.player.income);
    }

    updateFromPlayer(player: Player) {
        this.player = player;
        this.playerLabel.setText("Player " + this.id);
        this.moneyLabel.setText("Gold: " + this.player.money);
        this.livesLabel.setText("Lives: " + this.player.lives);
        this.incomeLabel.setText("Income: " + this.player.income);
    }
}