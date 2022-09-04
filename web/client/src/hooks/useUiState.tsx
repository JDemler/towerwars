import { useContext, useEffect, useReducer, createContext } from 'react';
import React from 'react';
import UiState from '../models/UiState';
import GamePhase from '../models/GamePhase';
import GameClient from '../game/GameClient';
import { GameStateUpdateDispatch } from '../game/GameClient';
import { GameState } from '../models';
import { InitialUiState } from '../models/UiState';
    
type UiStateContextAction =
    | { type: "set-loading"; }
    | { type: "set-uiState"; uiState: UiState }

    | { type: "set-gameClient"; gameClient: GameClient }
    | { type: "set-gameState"; gameState: GameState }
    | { type: "clear-gameState" }
    | { type: "set-gamePhase"; gamePhase: GamePhase }

    | { type: "set-mobTypes"; mobTypes: string[] }
    | { type: "set-towerTypes"; towerTypes: string[] }

function reducer (state: InitialUiState | undefined, action: UiStateContextAction): InitialUiState | undefined {
    switch (action.type) {
        case 'set-loading': {
            return undefined
        }
        case 'set-uiState': {
            return action.uiState;
        }
        case 'set-gameClient': {
            return state === undefined ? undefined : {
                ...state,
                gameClient: action.gameClient
            }
        }
        case 'set-gameState': {
            return state === undefined ? undefined : {
                ...state,
                gameState: action.gameState,
            }
        }
        case 'clear-gameState': {
            return state === undefined ? undefined : {
                ...state,
                gameState: undefined,
            }
        }
        case 'set-gamePhase': {
            return state === undefined ? undefined : {
                ...state,
                gamePhase: action.gamePhase,
            }
        }
        case 'set-mobTypes': {
            return state === undefined ? undefined : {
                ...state,
                mobTypes: action.mobTypes,
            }
        }
        case 'set-towerTypes': {
            return state === undefined ? undefined : {
                ...state,
                towerTypes: action.towerTypes,
            }
        }
        default:
            return state;
    }
}

type InitialUiStateContextType = [InitialUiState | undefined, React.Dispatch<UiStateContextAction>];
type UiStateContextType = [UiState, React.Dispatch<UiStateContextAction>];

const UiStateContext = createContext<InitialUiStateContextType | undefined>(undefined);

export type UiStateDispatch = React.Dispatch<UiStateContextAction>;

export const UiStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [context, dispatch] = useReducer(reducer, {
        gameClient: undefined,
        gameState: undefined,

        gamePhase: undefined,

        mobTypes: undefined,
        towerTypes: undefined,
    });

    useEffect(() => {
        const handleGameStateAction: GameStateUpdateDispatch = (action, gameClient) => {
            switch(action.type) {
                case 'state': {
                    dispatch({ type: 'set-gamePhase', gamePhase: action.gameStatus });
                    break;
                }
                case 'gameState': {
                    if (action.kind === 'create' || action.kind === 'update') {
                        dispatch({ type: 'set-gameState', gameState: action.gameState });
                    } else {
                        dispatch({ type: 'clear-gameState' });
                    }
                    break;
                }
                default: {
                    console.error('Unknown game state change action', action);
                    return;
                }
            }
        }

        const gameClient = new GameClient(handleGameStateAction);

        dispatch({ type: 'set-gameClient', gameClient });
    }, []);
    
    return (
        <UiStateContext.Provider value={[context, dispatch]}>
            {children}
        </UiStateContext.Provider>
    )
}

export function useUiStateOpt(): InitialUiStateContextType | undefined {
    return useContext(UiStateContext);
}

export function useUiState(): UiStateContextType {
    const [uiState, dispatch] = useUiStateOpt()!;

    return [uiState! as UiState, dispatch];
}