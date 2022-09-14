import ApiClient from '@clients/ApiClient';
import WebSocketClient from '@clients/WebSocketClient';
import { BuildTurretEvent, BuyMobEvent } from '@lib/FieldEvent';
import { GridCoordinate } from '@grid';
import { AddedPlayerModel, BulletModel, FieldModel, GameState, MobModel, PlayerModel, TowerModel, GamePhase, TowerTypeModel, MobTypeModel, BarracksModel } from '@models';

export type GameChangeActionChangeKind = 'create' | 'update';
export type GameChangeActionDeleteKind = 'delete';

export type FieldChangeAction = 
    // GameState actions
    | { type: "gameState"; kind: GameChangeActionChangeKind; gameState: GameState }
    | { type: "gameState"; kind: GameChangeActionDeleteKind; }
    // State
    | { type: "state"; gameStatus: GamePhase }

    // TowerTypes actions
    | { type: "towerTypes"; kind: GameChangeActionChangeKind; towerTypes: TowerTypeModel[] }
    // MobTypes actions
    | { type: "mobTypes"; kind: GameChangeActionChangeKind; mobTypes: MobTypeModel[] }

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
    // Barracks actions
    | { type: "barracks"; kind: GameChangeActionChangeKind; fieldId: number; barracks: BarracksModel }
    | { type: "barracks"; kind: GameChangeActionDeleteKind; fieldId: number; barracksId: number }

export type FieldUpdateDispatch = (action: FieldChangeAction, gameClient: GameClient) => void;

export default class GameClient {
    private webSocketClient?: WebSocketClient;

    public player?: AddedPlayerModel;

    private gameStateUpdateDispatches: FieldUpdateDispatch[] = [];

    public get enemyPlayerFieldId() {
        return this.player !== undefined
            ? 1 - this.player.fieldId
            : undefined
    }

    public start() {
        this.initializeApi();
    }

    public onDispatch(callback: FieldUpdateDispatch) {
        this.gameStateUpdateDispatches.push(callback);
    }

    private dispatch(action: FieldChangeAction) {
        for (const dispatcher of this.gameStateUpdateDispatches) {
            dispatcher(action, this);
        }
    }

    private initializeWebSocket() {
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

    private initializeApi() {
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

                    this.dispatch({ type: "gameState", kind: 'create', gameState });
                    this.dispatch({ type: 'state', gameStatus: gameState.state });

                    this.loadTowerTypes(addedPlayer.gameId);
                    this.loadMobTypes(addedPlayer.gameId);
                }).catch(error => {
                    console.error(error);
                    
                    this.dispatch({ type: 'state', gameStatus: 'WaitingForPlayers'});
                })

        } else {
            console.log("No added player in session storage.");

            this.dispatch({ type: 'state', gameStatus: 'WaitingForPlayers'});
        }
    }

    public loadTowerTypes(gameId: string) {
        ApiClient.getTowerTypes(gameId)
            .then(towerTypes => {
                console.log('Tower types', towerTypes);
                this.dispatch({ type: 'towerTypes', kind: 'create', towerTypes });
            })
    }

    public loadMobTypes(gameId: string) {
        ApiClient.getMobTypes(gameId)
            .then(mobTypes => {
                console.log('Mob types', mobTypes);
                this.dispatch({ type: 'mobTypes', kind: 'create', mobTypes });
            })
    }

    public end() {
        this.webSocketClient?.disconnect();
    }

    public joinGame(playerName: string) {
        ApiClient.joinGame(playerName)
            .then(addedPlayer => {
                this.player = addedPlayer;
                sessionStorage.setItem('addedPlayer', JSON.stringify(addedPlayer));
                console.log('Joined', addedPlayer);

                this.initializeWebSocket();

                ApiClient.getGameState(addedPlayer.gameId)
                    .then(gameState => {
                        this.dispatch({ type: "gameState", kind: 'create', gameState });
                        this.dispatch({ type: 'state', gameStatus: gameState.state });
                    }).catch(error => {
                        console.error(error);
                    })
            }).catch(err => {
                console.error('Error while joining game', err);
            })
    }

    // Game Functions
    public buyMob(mobKey: string) {
        if (this.webSocketClient === undefined) {
            return console.error('Websocket not initialised');
        }
        if (this.player === undefined || this.enemyPlayerFieldId === undefined) {
            return console.error('Not a player');
        }

        this.webSocketClient.dispatchFieldEvent(new BuyMobEvent(this.player, this.enemyPlayerFieldId, mobKey));
    }

    public buildTurret(coordinate: GridCoordinate, towerType: string) {
        if (this.webSocketClient === undefined) {
            return console.error('Websocket not initialised');
        }
        if (this.player === undefined) {
            return console.error('Not a player');
        }

        this.webSocketClient.dispatchFieldEvent(new BuildTurretEvent(this.player, coordinate.x, coordinate.y, towerType));
    }

    private handleWebSocketEvent(event: any) {
        const eventType: 'gameStateChanged' | 'player' | 'tower' | 'mob' | 'bullet' | 'barracks' = event.type;
        const eventKind: 'create' | 'update' | 'delete' | undefined = event.kind;
        const eventPayload = event.payload;
        const fieldId = event.fieldId;


        switch (eventType) {
            case "gameStateChanged":
                this.dispatch({ type: "state", gameStatus: eventPayload.gameState });

                console.log('Game state changed', eventPayload.gameState);

                if (!this.player) {
                    console.error('Game State changed, but player is not loaded');
                    return;
                }

                ApiClient.getGameState(this.player.gameId).then(gameState => {
                    this.dispatch({ type: "gameState", kind: 'update', gameState });
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
                    this.dispatch({ type: 'player', kind: eventKind, fieldId, player: PlayerModel.fromJSON(eventPayload) });
                else if (eventKind === "delete")
                    this.dispatch({ type: 'player', kind: eventKind, fieldId, playerId: eventPayload });
                break;
            case "tower":
                if (eventKind === "create" || eventKind === "update")
                    this.dispatch({ type: 'tower', kind: eventKind, fieldId, tower: TowerModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.dispatch({ type: 'tower', kind: eventKind, fieldId, towerId: eventPayload });
                break;
            case "mob":
                if (eventKind === "create" || eventKind === "update")
                    this.dispatch({ type: 'mob', kind: eventKind, fieldId, mob: MobModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.dispatch({ type: 'mob', kind: eventKind, fieldId, mobId: eventPayload });
                break;
            case "bullet":
                if (eventKind === "create" || eventKind === "update")
                    this.dispatch({ type: 'bullet', kind: eventKind, fieldId, bullet: BulletModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.dispatch({ type: 'bullet', kind: eventKind, fieldId, bulletId: eventPayload });
                break;
            case "barracks":
                if (eventKind === "create" || eventKind === "update")
                    this.dispatch({ type: 'barracks', kind: eventKind, fieldId, barracks: BarracksModel.fromJSON(eventPayload) });
                else if (eventKind === 'delete')
                    this.dispatch({ type: 'barracks', kind: eventKind, fieldId, barracksId: eventPayload });
                break;
            default:
                console.log("Unknown event type:", eventType, event);
        }
    }
}