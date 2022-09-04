import ApiClient from '../lib/clients/ApiClient';
import WebSocketClient from '../lib/clients/WebSocketClient';
import { BuildTurretEvent, BuyMobEvent } from '../lib/FieldEvent';
import GridCoordinate from '../lib/GridCoordinate';
import { AddedPlayerModel, BulletModel, FieldModel, GameState, MobModel, PlayerModel, TowerModel } from '../models';
import GamePhase from '../models/GamePhase';

export type GameChangeActionGameType = 'gameState' | 'state';
export type GameChangeActionFieldType = 'player' | 'field' | 'tower' | 'mob' | 'bullet';

export type GameChangeActionChangeKind = 'create' | 'update';
export type GameChangeActionDeleteKind = 'delete';

export type GameStateChangeAction =
    // GameState actions
    | { type: "gameState"; kind: GameChangeActionChangeKind; gameState: GameState }
    | { type: "gameState"; kind: GameChangeActionDeleteKind; }
    // State
    | { type: "state"; gameStatus: GamePhase }

export type FieldChangeAction =
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

export type GameStateUpdateDispatch = (action: GameStateChangeAction, gameClient: GameClient) => void;
export type FieldUpdateDispatch = (action: FieldChangeAction, gameClient: GameClient) => void;

export default class GameClient {
    private webSocketClient?: WebSocketClient;

    private gameStateUpdateDispatch: GameStateUpdateDispatch;
    public fieldUpdateDispatch?: FieldUpdateDispatch;

    public player?: AddedPlayerModel;

    public get enemyPlayerFieldId() {
        return this.player !== undefined
            ? 1 - this.player.fieldId
            : undefined
    }

    constructor(gameStateUpdateDispatch: GameStateUpdateDispatch) {
        this.gameStateUpdateDispatch = gameStateUpdateDispatch;

        this.initializeApi();
    }

    initializeWebSocket() {
        if (this.player === undefined) {
            console.error('Cannot initialize websocket without player');
            return;
        }

        try {
            this.webSocketClient = new WebSocketClient(this.player.gameId, this.player.key);

            this.webSocketClient.webSocket.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);

                this.handleWebSocketEvent(message);
            }

            return this.webSocketClient;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    initializeApi() {
        const sessionAddedPlayer = sessionStorage.getItem("addedPlayer");

        if (sessionAddedPlayer !== null) {
            const addedPlayer = AddedPlayerModel.fromJSON(JSON.parse(sessionAddedPlayer));
            this.player = addedPlayer;

            if (!addedPlayer.gameId) {
                console.error('Stored player has no gameId');
                return;
            }

            console.log("Loaded added player from session storage:", addedPlayer);

            this.initializeWebSocket();

            ApiClient.getGameState(addedPlayer.gameId)
                .then(gameState => {
                    if (gameState.state === "GameOver") {
                        console.log("Found game is already over.");
                        return;
                    }

                    this.gameStateUpdateDispatch({ type: "gameState", kind: 'create', gameState }, this);
                }).catch(error => {
                    console.error(error);
                    
                    this.gameStateUpdateDispatch({ type: 'state', gameStatus: 'WaitingForPlayers'}, this);
                })
        } else {
            console.log("No added player in session storage.");

            this.gameStateUpdateDispatch({ type: 'state', gameStatus: 'WaitingForPlayers'}, this);
        }
    }

    end() {
        this.webSocketClient?.disconnect();
    }

    joinGame(playerName: string) {
        ApiClient.joinGame(playerName)
            .then(addedPlayer => {
                this.player = addedPlayer;
                sessionStorage.setItem('addedPlayer', JSON.stringify(addedPlayer));
                console.log('Joined', addedPlayer);

                this.initializeWebSocket();

                ApiClient.getGameState(addedPlayer.gameId)
                    .then(gameState => {
                        this.gameStateUpdateDispatch({ type: "gameState", kind: 'create', gameState }, this);
                    }).catch(error => {
                        console.error(error);
                    })
            }).catch(err => {
                console.error('Error while joining game', err);
            })
    }

    // Game Functions
    buyMob() {
        if (this.webSocketClient === undefined) {
            return console.error('Websocket not initialised');
        }
        if (this.player === undefined || this.enemyPlayerFieldId === undefined) {
            return console.error('Not a player');
        }

        this.webSocketClient.dispatchFieldEvent(new BuyMobEvent(this.player, this.enemyPlayerFieldId, 'confusedKid'));
    }

    buildTurret(coordinate: GridCoordinate) {
        if (this.webSocketClient === undefined) {
            return console.error('Websocket not initialised');
        }
        if (this.player === undefined) {
            return console.error('Not a player');
        }

        this.webSocketClient.dispatchFieldEvent(new BuildTurretEvent(this.player, coordinate.x, coordinate.y, 'likeButton'));
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
                this.gameStateUpdateDispatch({ type: "state", gameStatus: eventPayload.gameState }, this);

                if (!this.player) {
                    console.error('Game State changed, but player is not loaded');
                    return;
                }

                ApiClient.getGameState(this.player.gameId).then(gameState => {
                    this.gameStateUpdateDispatch({ type: "gameState", kind: 'update', gameState }, this);
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
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'player', kind: eventKind, fieldId, player: PlayerModel.fromJSON(eventPayload) }, this);
                else if (eventKind === "delete")
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'player', kind: eventKind, fieldId, playerId: eventPayload }, this);
                break;
            case "tower":
                if (eventKind === "create" || eventKind === "update")
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'tower', kind: eventKind, fieldId, tower: TowerModel.fromJSON(eventPayload) }, this);
                else if (eventKind === 'delete')
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'tower', kind: eventKind, fieldId, towerId: eventPayload }, this);
                break;
            case "mob":
                if (eventKind === "create" || eventKind === "update")
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'mob', kind: eventKind, fieldId, mob: MobModel.fromJSON(eventPayload) }, this);
                else if (eventKind === 'delete')
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'mob', kind: eventKind, fieldId, mobId: eventPayload }, this);
                break;
            case "bullet":
                if (eventKind === "create" || eventKind === "update")
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'bullet', kind: eventKind, fieldId, bullet: BulletModel.fromJSON(eventPayload) }, this);
                else if (eventKind === 'delete')
                    this.fieldUpdateDispatch && this.fieldUpdateDispatch({ type: 'bullet', kind: eventKind, fieldId, bulletId: eventPayload }, this);
                break;
            case "barracks":
                break;
            default:
                console.log("Unknown event type:", eventType, event);
        }
    }
}