import { Field } from "../data/field";
import { Mob } from "../data/mob";
import { Player } from "../data/player";
import { Tower } from "../data/tower";
import { drawTWMap } from "../data/twmap";
import GameScene from "../scenes/Game";
import { GameMob } from "./mob";
import { GamePlayer } from "./player";
import { GameTower } from "./tower";

export class GameField extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    field: Field;
    mobs: GameMob[] = [];
    towers: GameTower[] = [];
    player: GamePlayer;
    scene: GameScene;
    constructor(scene: GameScene, field: Field) {
        super(scene, 'GameField');
        this.id = field.id;
        this.scene = scene;
        this.scene.setOffsetForField(this.id);
        this.field = field;
        drawTWMap(this.field.twmap, (x, y) => { this.buildTower(x, y) }, this.scene);
        this.player = new GamePlayer(scene, field.player);
        this.drawMobButtons();
    }

    buildTower(x: number, y: number): void {
        this.scene.websocket?.send(JSON.stringify({
            fieldId: this.id,
            eventType: "buildTower",
            payload: JSON.stringify({
                towerType: this.scene.towerTypes[0].name,
                x: x,
                y: y
            })
        }));
    }

    handleEvent(event: any): void {
        switch (event.type) {
            case "towerCreated":
                this.createTower(event.payload.tower);
                break;
            case "fieldUpdated":
                this.updateFromField(event.payload);
                break;
            case "mobCreated":
                this.createMob(event.payload.mob);
            case "mobUpdated":
                this.updateMob(event.payload.mob);
                break;
            case "mobDestroyed":
                this.destroyMob(event.payload.mobId);
                break;
            case "playerUpdated":
                this.updatePlayer(event.payload.player);
                break;
        }
    }

    createTower(tower: Tower) {
        this.towers.push(new GameTower(this.scene, tower));
    }

    updateFromField(field: Field) {
        this.field = field;
    }

    updatePlayer(player: Player) {
        this.player.updateFromPlayer(player);
    }

    createMob(mob: Mob) {
        this.mobs.push(new GameMob(this.scene, mob));
    }

    updateMob(mob: Mob) {
        var gameMob = this.mobs.find(m => m.id == mob.id);
        if (gameMob) {
            gameMob.updateFromMob(mob);
        }
    }

    destroyMob(mobId: number) {
        for (var i = this.mobs.length - 1; i >= 0; i--) {
            if (this.mobs[i].id === mobId) {
                this.mobs[i].destroy();
                this.mobs.splice(i, 1);
            }
        }
    }

    drawMobButtons() {
        this.scene.mobTypes.forEach((mobType, i) => {
            this.scene.add.text(
                100 + this.scene.offsetX + (i * 100)
                , 500
                , mobType.name, {
                font: '48px Arial',
            })
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.scene.websocket?.send(
                        JSON.stringify({
                            fieldId: this.id,
                            eventType: "buyMob",
                            payload: JSON.stringify({
                                mobType: mobType.name,
                                targetFieldId: 1 - this.id
                            })
                        })
                    );
                });
        });
    }



}