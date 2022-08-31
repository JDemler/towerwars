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
    pingLabel: Phaser.GameObjects.Text;
    constructor(scene: GameScene, player: Player) {
        super(scene, 'GamePlayer');
        this.id = player.id;
        this.player = player;
        this.scene = scene;
        this.playerLabel = this.scene.add.text(this.scene.offsetX - 145, 10 + this.scene.offsetY, "Player: " + this.player.name);
        this.moneyLabel = this.scene.add.text(this.scene.offsetX - 145, 30 + this.scene.offsetY, "Gold: " + Math.floor(this.player.money / 100));
        this.livesLabel = this.scene.add.text(this.scene.offsetX - 145, 50 + this.scene.offsetY, "Lives: " + this.player.lives);
        this.incomeLabel = this.scene.add.text(this.scene.offsetX - 145, 70 + this.scene.offsetY, "Income: " + this.player.income / 100);
        this.pingLabel = this.scene.add.text(this.scene.offsetX - 145, 90 + this.scene.offsetY, "Ping: " + Math.round(this.player.latency / 1000) + "ms");

    }

    updateFromPlayer(player: Player) {
        this.player = player;
        this.playerLabel.setText("Player: " + this.player.name);
        this.moneyLabel.setText("Gold: " + Math.floor(this.player.money / 100));
        this.livesLabel.setText("Lives: " + this.player.lives);
        this.incomeLabel.setText("Income: " + this.player.income / 100);
        this.pingLabel.setText("Ping: " + Math.round(this.player.latency / 1000) + "ms");
    }
}