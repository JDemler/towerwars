import ApiClient from '../lib/clients/ApiClient';
import WebSocketClient from '../lib/clients/WebSocketClient';
import { BuildTurretEvent, BuyMobEvent } from '../lib/FieldEvent';
import GridCoordinate from '../lib/GridCoordinate';
import { AddedPlayerModel, BulletModel, FieldModel, GameState, MobModel, PlayerModel, TowerModel } from '../models';

export type GameChangeAction =
    // GameState actions
    | { type: "clear-gameState"; }
    | { type: "set-gameState"; gameState: GameState }
    | { type: "update-gameStatus"; gameStatus: "WaitingForPlayers" | "Playing" | "GameOver" }
    // Player actions
    | { type: "update-player"; fieldId: number, player: PlayerModel }
    // Field actions
    | { type: "update-field"; fieldId: number, field: FieldModel }
    // Tower actions
    | { type: "add-tower"; fieldId: number, tower: TowerModel }
    | { type: "update-tower"; fieldId: number, tower: TowerModel }
    | { type: "delete-tower"; fieldId: number, towerId: number }
    // Mob actions
    | { type: "add-mob"; fieldId: number, mob: MobModel }
    | { type: "update-mob"; fieldId: number, mob: MobModel }
    | { type: "delete-mob"; fieldId: number, mobId: number }
    // Bullet actions
    | { type: "add-bullet"; fieldId: number, bullet: BulletModel }
    | { type: "update-bullet"; fieldId: number, bullet: BulletModel }
    | { type: "delete-bullet"; fieldId: number, bulletId: number }

export type GameUpdateDispatch = (action: GameChangeAction) => void;

export default class GameClient {
    private webSocketClient: WebSocketClient;

    private updateDispatch: GameUpdateDispatch;

    public player?: AddedPlayerModel;
    
    public get enemyPlayerFieldId() {
        return this.player !== undefined
            ? 1 - this.player.fieldId
            : undefined
    }
    
    constructor(updateDispatch: GameUpdateDispatch) {
        this.updateDispatch = updateDispatch;
        
        this.webSocketClient = this.initializeWebSocket();

        this.initializeApi();
    }

    initializeWebSocket() {
        const webSocketClient = new WebSocketClient();

        webSocketClient.webSocket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            this.handleWebSocketEvent(message);
        }

        return webSocketClient;
    }

    initializeApi() {
        ApiClient.getGameState()
            .then(gameState => {
                this.updateDispatch({ type: "set-gameState", gameState });

                // Try loading the added player from the session storage
                if (gameState.state !== "WaitingForPlayers") {
                    const sessionAddedPlayer = sessionStorage.getItem("addedPlayer");

                    if (sessionAddedPlayer !== null) {
                        const addedPlayer = JSON.parse(sessionAddedPlayer);
                        this.player = addedPlayer;

                        console.log("Loaded added player from session storage:", addedPlayer);
                    }
                }
            }).catch(error => {
                console.error(error);
            })
    }

    end() {
        this.webSocketClient.disconnect();
    }

    joinGame(playerName: string) {
        ApiClient.joinGame(playerName)
            .then(addedPlayerModel => {
                this.player = addedPlayerModel;
                sessionStorage.setItem('addedPlayer', JSON.stringify(addedPlayerModel));
                console.log('Joined', addedPlayerModel);
            }).catch(err => {
                console.error('Error while joining game', err);
            })
    }

    // Game Functions
    buyMob() {
        if (this.player === undefined || this.enemyPlayerFieldId === undefined) {
            return console.error('Not a player');
        }

        this.webSocketClient?.dispatchFieldEvent(new BuyMobEvent(this.player, this.enemyPlayerFieldId, 'Confused Kid'));
    }

    buildTurret(coordinate: GridCoordinate) {
        if (this.player === undefined) {
          return console.error('Not a player');
        }
        
        this.webSocketClient?.dispatchFieldEvent(new BuildTurretEvent(this.player, coordinate.x, coordinate.y, 'Like Button'));
    }

    handleWebSocketEvent(event: any) {
        const fieldId = event.payload.fieldId;
    
        switch (event.type) {
            case "playerJoined":
                console.log('Player joined', event.payload)
                break;
            case "gameStateChanged":
                this.updateDispatch({ type: "update-gameStatus", gameStatus: event.payload.gameState });
    
                ApiClient.getGameState().then(gameState => {
                    this.updateDispatch({ type: "set-gameState", gameState });
                }).catch(error => {
                    console.error(error);
                })
    
                // On Gameover, cleanup the player info in the session storage
                if (event.payload.gameState === "GameOver") {
                    sessionStorage.removeItem('addedPlayer');
                }
                break;
            case "playerUpdated":
                this.updateDispatch({ type: 'update-player', fieldId, player: PlayerModel.fromJSON(event.payload.player) });
                break;
            case "towerCreated":
                this.updateDispatch({ type: 'add-tower', fieldId, tower: TowerModel.fromJSON(event.payload.tower) });
                break;
            case "mobCreated":
                this.updateDispatch({ type: 'add-mob', fieldId, mob: MobModel.fromJSON(event.payload.mob) });
                break;
            case "mobUpdated":
                this.updateDispatch({ type: 'update-mob', fieldId, mob: MobModel.fromJSON(event.payload.mob) });
                break;
            case "mobDestroyed":
                this.updateDispatch({ type: 'delete-mob', fieldId, mobId: event.payload.mobId });
                break;
            case "bulletCreated":
                this.updateDispatch({ type: 'add-bullet', fieldId, bullet: BulletModel.fromJSON(event.payload.bullet) });
                break;
            case "bulletDestroyed":
                this.updateDispatch({ type: 'delete-bullet', fieldId, bulletId: event.payload.bulletId });
                break;
            default:
                console.log("Unknown event type:", event.type, event);
        }
    }
}