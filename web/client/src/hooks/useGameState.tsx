import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import GameState from '../models/GameState';
import React from 'react';
import ApiClient from '../lib/clients/ApiClient';
import { PlayerModel, FieldModel, TowerModel, MobModel, BulletModel } from '../models';
import WebSocketClient from '../lib/clients/WebSocketClient';
import GridCoordinate from '../lib/GridCoordinate';
import { BuildTurretEvent, BuyMobEvent } from '../lib/FieldEvent';

type Action =
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

function reducer(state: GameState | undefined, action: Action): GameState | undefined {

    console.log("<-", action.type, action);

    const newState = structuredClone(state) as GameState | undefined;
    const updatedField = (action as any).fieldId != undefined && newState !== undefined
        ? newState.fields.find(field => field.id === (action as any).fieldId)
        : undefined;

    switch (action.type) {
        // GameState actions
        case 'clear-gameState':
            return undefined;
        case 'set-gameState':
            return action.gameState;
        case 'update-gameStatus':
            if (newState === undefined) return newState;

            newState.state = action.gameStatus;

            return newState;

        // Player actions
        case 'update-player':
            if (updatedField === undefined) return newState;

            updatedField.player = action.player;

            return newState;

        // Field actions
        case 'update-field':
            if (newState === undefined) return newState;

            newState.fields = [...newState.fields.filter(field => field.id !== action.field.id), action.field];

            return newState

        // Tower actions
        case 'add-tower':
            if (updatedField === undefined) return newState;

            updatedField.towers.push(action.tower);

            return newState;
        case 'update-tower':
            if (updatedField === undefined) return newState;

            updatedField.towers = [...updatedField.towers.filter(tower => tower.id !== action.tower.id), action.tower]

            return newState;
        case 'delete-tower':
            if (updatedField === undefined) return newState;

            updatedField.towers = [...updatedField.towers.filter(tower => tower.id !== action.towerId)]

            return newState;

        // Mob actions
        case 'add-mob':
            if (updatedField === undefined) return newState;

            updatedField.mobs.push(action.mob);

            return newState;
        case 'update-mob':
            if (updatedField === undefined) return newState;

            updatedField.mobs = [...updatedField.mobs.filter(mob => mob.id !== action.mob.id), action.mob];

            return newState;
        case 'delete-mob':
            if (updatedField === undefined) return;

            updatedField.mobs = updatedField.mobs.filter(mob => mob.id !== action.mobId);

            return newState;

        // Bullet actions
        case 'add-bullet':
            if (updatedField === undefined) return newState;

            updatedField.bullets.push(action.bullet);

            return newState;
        case 'update-bullet':
            if (updatedField === undefined) return newState;

            updatedField.bullets = [...updatedField.bullets.filter(bullet => bullet.id !== action.bullet.id), action.bullet];

            return newState;
        case 'delete-bullet':
            if (updatedField === undefined) return;

            updatedField.bullets = updatedField.bullets.filter(bullet => bullet.id !== action.bulletId);

            return newState;

        // Fallback
        default:
            return state;
    }
}

interface GameStateContextProps {
    gameState?: GameState;

    joinGame: () => void;
    playerId?: number;
    enemyPlayerId?: number;

    buyMob: () => void;
    buildTurret: (coordinate: GridCoordinate) => void;
}

const GameStateContext = createContext<GameStateContextProps | undefined>(undefined);

export const GameStateProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, undefined);

    const [webSocketClient, setWebSocketClient] = useState<WebSocketClient>();

    const [playerId, setPlayerId] = useState<number | undefined>(1);
    const enemyPlayerId = playerId !== undefined
        ? 1 - playerId
        : undefined

    // Websocket Client
    useEffect(() => {
        console.log('Connecting Websocket...');
        const webSocketClient = new WebSocketClient();

        webSocketClient.webSocket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            handleWebSocketEvent(message, dispatch);
        }

        setWebSocketClient(webSocketClient);

        return () => {
            console.log('Disconnecting Websocket...');
            webSocketClient.disconnect();
        }
    }, [])

    // Api Client 
    useEffect(() => {
        ApiClient.getGameState().then(gameState => {
            dispatch({ type: "set-gameState", gameState });
        }).catch(error => {
            console.error(error);
        })
    }, []);

    // Join Game
    const joinGame = () => {
        ApiClient.joinGame()
            .then(playerId => {
                setPlayerId(playerId);
                console.log('Joined', playerId);
            }).catch(err => {
                console.error('Error while joining game', err);
            })
    }

    // Game Functions
    const buyMob = () => {
        if (playerId === undefined || enemyPlayerId === undefined) {
            return console.error('Not a player');
        }

        webSocketClient?.dispatchFieldEvent(new BuyMobEvent(playerId, enemyPlayerId, 'Circle'));
    }

    const buildTurret = (coordinate: GridCoordinate) => {
        if (playerId === undefined) {
          return console.error('Not a player');
        }
        
        webSocketClient?.dispatchFieldEvent(new BuildTurretEvent(playerId, coordinate.x, coordinate.y, 'Arrow'));
    }

    return (
        <GameStateContext.Provider value={{
            gameState: state,

            joinGame,
            playerId,
            enemyPlayerId,

            buyMob,
            buildTurret,
        }}>
            {children}
        </GameStateContext.Provider>
    )
}

function handleWebSocketEvent(event: any, dispatch: React.Dispatch<Action>) {
    const fieldId = event.payload.fieldId;

    switch (event.type) {
        case "playerJoined":
            console.log('Player joined', event.payload)
            break;
        case "gameStateChanged":
            dispatch({ type: "update-gameStatus", gameStatus: event.payload.gameState });

            ApiClient.getGameState().then(gameState => {
                dispatch({ type: "set-gameState", gameState });
            }).catch(error => {
                console.error(error);
            })
            break;
        case "playerUpdated":
            dispatch({ type: 'update-player', fieldId, player: PlayerModel.fromJSON(event.payload.player) });
            break;
        case "towerCreated":
            dispatch({ type: 'add-tower', fieldId, tower: TowerModel.fromJSON(event.payload.tower) });
            break;
        case "mobCreated":
            dispatch({ type: 'add-mob', fieldId, mob: MobModel.fromJSON(event.payload.mob) });
            break;
        case "mobUpdated":
            dispatch({ type: 'update-mob', fieldId, mob: MobModel.fromJSON(event.payload.mob) });
            break;
        case "mobDestroyed":
            dispatch({ type: 'delete-mob', fieldId, mobId: event.payload.mobId });
            break;
        case "bulletCreated":
            dispatch({ type: 'add-bullet', fieldId, bullet: BulletModel.fromJSON(event.payload.bullet) });
            break;
        case "bulletDestroyed":
            dispatch({ type: 'delete-bullet', fieldId, bulletId: event.payload.bulletId });
            break;
        default:
            console.log("Unknown event type:", event.type, event);
    }
}

export function useGameStateOpt() {
    return useContext(GameStateContext);
}

export function useGameState() {
    return useGameStateOpt()!;
}