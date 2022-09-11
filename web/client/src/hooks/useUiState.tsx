import React, { useContext, useEffect, useReducer, createContext } from 'react';
import { GamePhase, GameState, PlayerModel, UiState, InitialUiState, MobTypeModel, TowerTypeModel } from '@models';
import GameClient from '@game/GameClient';
    
export type UiStateContextAction =
    | { type: "set-loading"; }
    | { type: "set-uiState"; uiState: UiState }

    | { type: "set-gameClient"; gameClient: GameClient }
    | { type: "set-gameState"; gameState: GameState }
    | { type: "clear-gameState" }
    | { type: "set-gamePhase"; gamePhase: GamePhase }

    | { type: "set-mobTypes"; mobTypes: MobTypeModel[] }
    | { type: "set-towerTypes"; towerTypes: TowerTypeModel[] }
    
    | { type: "set-playerModel"; playerModel: PlayerModel }

function reducer (state: InitialUiState | undefined, action: UiStateContextAction): InitialUiState | undefined {
    if (action.type === 'set-uiState')
        return action.uiState;

    if (state === undefined)
        return undefined;

    switch (action.type) {
        case 'set-loading': {
            return undefined
        }
        case 'set-gameClient': {
            return {
                ...state,
                gameClient: action.gameClient
            }
        }
        case 'set-gameState': {
            return {
                ...state,
                gameState: action.gameState,
            }
        }
        case 'clear-gameState': {
            return {
                ...state,
                gameState: undefined,
            }
        }
        case 'set-gamePhase': {
            return {
                ...state,
                gamePhase: action.gamePhase,
            }
        }
        case 'set-mobTypes': {
            return {
                ...state,
                mobTypes: action.mobTypes,
            }
        }
        case 'set-towerTypes': {
            return {
                ...state,
                towerTypes: action.towerTypes,
            }
        }
        case 'set-playerModel': {
            return {
                ...state,
                playerModel: action.playerModel,
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

        playerModel: undefined,
    });

    useEffect(() => {
        const gameClient = new GameClient();

        gameClient.onDispatch((action) => {
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
                    return;
                }
            }
        })

        gameClient.start();

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