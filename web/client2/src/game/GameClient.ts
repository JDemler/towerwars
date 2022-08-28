import ApiClient from '../lib/clients/ApiClient';
import WebSocketClient from '../lib/clients/WebSocketClient';
import { BuildTurretEvent, BuyMobEvent } from '../lib/FieldEvent';
import GridCoordinate from '../lib/GridCoordinate';
import { AddedPlayerModel, BulletModel, FieldModel, GameState, MobModel, PlayerModel, TowerModel } from '../models';

export type GameChangeActionGameType = 'gameState' | 'state';
export type GameChangeActionFieldType = 'player' | 'field' | 'tower' | 'mob' | 'bullet';

export type GameChangeActionChangeKind = 'create' | 'update';
export type GameChangeActionDeleteKind = 'delete';

export type GameChangeAction =
    // GameState actions
    | { type: "gameState"; kind: GameChangeActionChangeKind; gameState: GameState }
    | { type: "gameState"; kind: GameChangeActionDeleteKind; }
    // State
    | { type: "state"; gameStatus: "WaitingForPlayers" | "Playing" | "GameOver" }
    // Player actions
    | { type: "player"; kind: GameChangeActionChangeKind; fieldId: number; player: PlayerModel }
    | { type: "player"; kind: GameChangeActionDeleteKind; fieldId: number; playerId: number }
    // Field actions
    | { type: "field"; kind: GameChangeActionChangeKind; fieldId: number; field: FieldModel }
    | { type: "field"; kind: GameChangeActionDeleteKind; fieldId: number }
    // Tower actions
    | { type: "tower"; kind: GameChangeActionChangeKind; fieldId: number; tower: TowerModel }
    | { type: "tower"; kind: GameChangeActionDeleteKind; fieldId: number; towerId: number }
    // Mob actions
    | { type: "mob"; kind: GameChangeActionChangeKind; fieldId: number; mob: MobModel }
    | { type: "mob"; kind: GameChangeActionDeleteKind; fieldId: number; mobId: number }
    // Bullet actions
    | { type: "bullet"; kind: GameChangeActionChangeKind; fieldId: number; bullet: BulletModel }
    | { type: "bullet"; kind: GameChangeActionDeleteKind; fieldId: number; bulletId: number }

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
                this.updateDispatch({ type: "gameState", kind: 'create', gameState });

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
        const eventType: 'gameStateChanged' | 'player' | 'tower' | 'mob' | 'bullet' | 'barracks' = event.type;
        const eventKind: 'create' | 'update' | 'delete' | undefined = event.kind;
        const eventPayload = event.payload;
        const fieldId = event.fieldId;
        
    
        switch (eventType) {
            // case "player":
            //     console.log('Player', eventKind, eventPayload)
            //     break;
            case "gameStateChanged":
                this.updateDispatch({ type: "state", gameStatus: eventPayload.gameState });
    
                ApiClient.getGameState().then(gameState => {
                    this.updateDispatch({ type: "gameState", kind: 'update', gameState });
                }).catch(error => {
                    console.error(error);
                })
    
                // On Gameover, cleanup the player info in the session storage
                if (eventPayload.gameState === "GameOver") {
                    sessionStorage.removeItem('addedPlayer');
                }
                break;
            case "player":
                if (eventKind === "create" || eventKind === "update")
                    this.updateDispatch({ type: 'player', kind: eventKind, fieldId, player: PlayerModel.fromJSON(eventPayload) });
                else if (eventKind === "delete")
                    this.updateDispatch({ type: 'player', kind: eventKind, fieldId, playerId: eventPayload });
                break;
            case "tower":
                if (eventKind === "create" || eventKind === "update")
                    this.updateDispatch({ type: 'tower', kind: eventKind, fieldId, tower: TowerModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.updateDispatch({ type: 'tower', kind: eventKind, fieldId, towerId: eventPayload });
                break;
            case "mob":
                if (eventKind === "create" || eventKind === "update")
                    this.updateDispatch({ type: 'mob', kind: eventKind, fieldId, mob: MobModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.updateDispatch({ type: 'mob', kind: eventKind, fieldId, mobId: eventPayload });
                break;
            case "bullet":
                if (eventKind === "create" || eventKind === "update")
                    this.updateDispatch({ type: 'bullet', kind: eventKind, fieldId, bullet: BulletModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.updateDispatch({ type: 'bullet', kind: eventKind, fieldId, bulletId: eventPayload });
                break;
            case "barracks":
                break;            
            default:
                console.log("Unknown event type:", eventType, event);
        }
    }
}