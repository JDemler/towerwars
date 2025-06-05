import { Application } from "pixi.js";
import { Viewport } from 'pixi-viewport';
import { Field } from "@gameObjects";
import { GridSettings } from "@grid";
import GameClient, { FieldChangeAction } from '@game/GameClient';
import { GameState, MobTypeModel, TowerTypeModel } from "@models";
import { UiStateDispatch } from '@hooks';

export interface GameInfo {
    towerTypes: TowerTypeModel[] | null;
    mobTypes: MobTypeModel[] | null;

    selectedTowerType: TowerTypeModel | null;
    selectedTowerId: number | null;
}

const beginGameLoop = (app: Application, viewport: Viewport, initialGameState: GameState | undefined, gameClient: GameClient, dispatchUiState: UiStateDispatch) => {
    const fields: Field[] = [];

    const clearFields = () => {
        fields.forEach(field => field.destroy());
        fields.length = 0;
    }

    const gameInfo: GameInfo = {
        towerTypes: null,
        mobTypes: null,

        selectedTowerType: null,
        selectedTowerId: null,
    }

    function setSelectedTowerType(towerTypeKey: string) {
        gameInfo.selectedTowerType = gameInfo.towerTypes?.find(t => t.key === towerTypeKey) ?? null
        dispatchUiState({ type: 'set-selectedTowerType', selectedTowerTypeKey: towerTypeKey });
    }

    dispatchUiState({ type: 'set-selectedTowerTypeHandler', selectedTowerTypeHandler: setSelectedTowerType });

    const handleGameChangeAction = (action: FieldChangeAction) => {
        if (action.type === 'gameState') {
            clearFields();
            if (action.kind === 'create' || action.kind === 'update') {
                for (let i = 0; i < action.gameState.fields.length; i++) {
                    const fieldModel = action.gameState.fields[i];

                    const field = new Field({ app, viewport, gameClient, gameInfo, dispatchUiState }, fieldModel);
                    field.container.position.x = i * (fieldModel.map.size.width * GridSettings.tileSize + GridSettings.tileSize * 2) + GridSettings.tileSize
                    field.container.position.y = GridSettings.tileSize;
                    fields.push(field);

                    if (fieldModel.id === gameClient.player?.fieldId) {
                        dispatchUiState({ type: 'set-playerModel', playerModel: fieldModel.player });
                        dispatchUiState({ type: 'set-barracksModel', barracksModel: fieldModel.barracks });
                    }
                }

                if (gameClient.player) {
                    gameClient.loadTowerTypes();
                    gameClient.loadMobTypes();
                }
            }
        }
        else if (action.type === 'state') {
            // State updates are handled outside of the game loop.
        }
        else if (action.type === 'towerTypes') {
            gameInfo.towerTypes = action.towerTypes;

            dispatchUiState({ type: 'set-towerTypes', towerTypes: action.towerTypes });

            if (gameInfo.selectedTowerType === null && gameInfo.towerTypes.length > 0) {
                setSelectedTowerType(gameInfo.towerTypes[0].key);
            }
        }
        else if (action.type === 'mobTypes') {
            gameInfo.mobTypes = action.mobTypes;

            dispatchUiState({ type: 'set-mobTypes', mobTypes: action.mobTypes });
        }
        else if (action.type === 'socialMediaNetworks') {
            // This is never called. But I cannot remove it because the else branch otherwise does not compile
            dispatchUiState({ type: 'set-socialMediaNetworks', networks: action.networks });
        }         
        else if (action.type === 'barracks') {
            if (action.fieldId !== gameClient.player?.fieldId)
                return;

            if (action.kind === 'create' || action.kind === 'update') {
                dispatchUiState({ type: 'set-barracksModel', barracksModel: action.barracks });
            }
        }
        else if (action.type === 'incomeCooldown') {
            dispatchUiState({ type: 'set-incomeCooldown', incomeCooldown: action.incomeCooldown });
        }
        else {
            const fieldId = action.fieldId;

            const field = fields.find(field => field.id === fieldId);

            if (field === undefined) {
                console.error('Unknown field: ' + fieldId);
                return;
            }

            field.handleGameChangeAction(action);
        }
    }

    gameClient.onDispatch(handleGameChangeAction);

    if (initialGameState !== undefined)
        handleGameChangeAction({ type: 'gameState', kind: 'create', gameState: initialGameState });

    app.ticker.add((delta) => {
        for (const field of fields) {
            field.update(delta, app.ticker.deltaMS);
        }
    });
}

export default beginGameLoop;