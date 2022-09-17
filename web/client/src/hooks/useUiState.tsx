import React, { useContext, useEffect, useReducer, createContext } from 'react';
import { GamePhase, GameState, PlayerModel, UiState, InitialUiState, MobTypeModel, TowerTypeModel, BarracksModel, TowerModel, SocialMediaNetworkModel } from '@models';
import GameClient from '@game/GameClient';

export type UiStateContextAction =
    | { type: "set-loading"; }
    | { type: "set-uiState"; uiState: UiState }

    | { type: "set-gameClient"; gameClient: GameClient }
    | { type: "set-gameState"; gameState: GameState }
    | { type: "clear-gameState" }
    | { type: "set-gamePhase"; gamePhase: GamePhase }

    | { type: "set-playerModel"; playerModel: PlayerModel }

    | { type: "set-socialMediaNetworks"; networks: SocialMediaNetworkModel[] }
    | { type: "set-mobTypes"; mobTypes: MobTypeModel[] }
    | { type: "set-towerTypes"; towerTypes: TowerTypeModel[] }
    | { type: "set-barracksModel"; barracksModel: BarracksModel }

    | { type: "set-selectedTowerTypeHandler"; selectedTowerTypeHandler: (towerType: string) => void }
    | { type: "set-selectedTowerType"; selectedTowerTypeKey: string }

    | { type: "set-selectedTower"; selectedTower: TowerModel }

function reducer(state: InitialUiState | undefined, action: UiStateContextAction): InitialUiState | undefined {
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
        case 'set-playerModel': {
            return {
                ...state,
                playerModel: action.playerModel,
            }
        }
        case 'set-socialMediaNetworks': {
            console.log("set-socialMediaNetworks", action.networks);
            return {
                ...state,
                socialMediaNetworks: action.networks,
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
        case 'set-barracksModel': {
            return {
                ...state,
                barracksModel: action.barracksModel,
            }
        }
        case 'set-selectedTowerTypeHandler': {
            return {
                ...state,
                setSelectedTowerType: action.selectedTowerTypeHandler,
            }
        }
        case 'set-selectedTowerType': {
            return {
                ...state,
                selectedTowerTypeKey: action.selectedTowerTypeKey,
            }
        }
        case 'set-selectedTower': {
            return {
                ...state,
                selectedTower: action.selectedTower,
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
    const [context, dispatch] = useReducer(reducer, {});

    useEffect(() => {
        const gameClient = new GameClient();

        gameClient.onDispatch((action) => {
            console.log("gameClient.onDispatch", action);
            switch (action.type) {
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
                case 'socialMediaNetworks': {
                    dispatch({ type: 'set-socialMediaNetworks', networks: action.networks });
                    break;
                }
                default: {
                    return;
                }
            }
        })
        gameClient.loadSocialMediaNetworks();

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