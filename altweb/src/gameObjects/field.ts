import { TileSize } from "../config";
import { Field } from "../data/field";
import { Mob } from "../data/mob";
import { Player } from "../data/player";
import { Tower } from "../data/tower";
import { drawTWMap } from "../data/twmap";
import GameScene from "../scenes/Game";
import { GameMob } from "./mob";
import { MobButtonDescription } from "./mobButtonDescription";
import { GamePlayer } from "./player";
import { GameTower } from "./tower";

const mobBtnSize = 4 * TileSize;

export class GameField extends Phaser.GameObjects.GameObject {
    //properties
    id: number;
    field: Field;
    mobs: GameMob[] = [];
    towers: GameTower[] = [];
    player: GamePlayer;
    scene: GameScene;
    mobButtons: Phaser.GameObjects.Image[] = [];
    mobBtnDesc: MobButtonDescription | undefined = undefined;
    tiles: Phaser.GameObjects.Rectangle[] = [];

    constructor(scene: GameScene, field: Field) {
        super(scene, 'GameField');
        this.id = field.id;
        this.scene = scene;
        this.scene.setOffsetForField(this.id);
        this.field = field;
        this.player = new GamePlayer(scene, field.player);
        if (scene.playerId == field.player.id) {
            drawTWMap(this.field.twmap, (x, y) => { this.buildTower(x, y) }, this.scene, true);
            this.drawMobButtons();
            this.mobBtnDesc = new MobButtonDescription(scene, this.scene.mobTypes[0]);
        } else {
            drawTWMap(this.field.twmap, (x, y) => { }, this.scene, false);
        }
    }

    buildTower(x: number, y: number): void {
        this.scene.websocket?.send(JSON.stringify({
            fieldId: this.id,
            eventType: "buildTower",
            payload: {
                towerKey: this.scene.getSelectedTowerKey(),
                x: x,
                y: y
            }
        }));
    }

    handleEvent(event: any): void {
        switch (event.type) {
            case "tower":
                switch (event.kind) {
                    case "create":
                        this.createTower(event.payload);
                        break;
                    case "upgrade":
                        this.upgradeTower(event);
                        break;
                    case "delete":
                        this.destroyTower(event.payload);
                }
                break;
            case "mob":
                switch (event.kind) {
                    case "create":
                        this.createMob(event.payload);
                        break;
                    case "update":
                        this.updateMob(event.payload);
                        break;
                    case "delete":
                        this.destroyMob(event.payload);
                }
                break;
            case "player":
                switch (event.kind) {
                    case "update":
                        this.updatePlayer(event.payload);
                        break;
                }
                break;
        }
    }

    createTower(tower: Tower) {
        this.towers.push(new GameTower(this.scene, tower, this.scene.getTowerType(tower.type)));
    }

    upgradeTower(tower: Tower) {
        this.towers.find(t => t.id == tower.id)?.upgrade(tower);
    }

    destroyTower(towerId: number) {
        //Find tower with id and destroy it
        for (var i = this.towers.length - 1; i >= 0; i--) {
            if (this.towers[i].id == towerId) {
                this.towers[i].destroy();
                this.towers.splice(i, 1);
            }
        }
    }

    updateFromField(field: Field) {
        this.field = field;
    }

    updatePlayer(player: Player) {
        console.log("update player");
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
        var postFxPlugin = this.scene.plugins.get('rexoutlinepipelineplugin');
        this.scene.mobTypes.forEach((mobType, i) => {
            var button = this.scene.add.image(window.innerWidth / 2 - ((this.scene.mobTypes.length / 2 - i) * mobBtnSize), window.innerHeight - (mobBtnSize / 2), mobType.key)
                .setScale(mobBtnSize)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    this.mobBtnDesc?.setToMobType(mobType);
                    postFxPlugin.add(button, {
                        thickness: 3,
                        outlineColor: 0xff8a50
                    });
                    button.setDepth(1);
                })
                .on('pointerout', () => {
                    postFxPlugin.remove(button);
                    button.setDepth(0);
                })
                .on('pointerdown', () => {
                    this.scene.websocket?.send(
                        JSON.stringify({
                            fieldId: this.id,
                            eventType: "buyMob",
                            payload: {
                                mobType: mobType.name,
                                targetFieldId: 1 - this.id
                            }
                        })
                    );
                });
            button.setDisplaySize(mobBtnSize, mobBtnSize)
            this.mobButtons.push(button);
        });
    }



}