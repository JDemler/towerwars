import { Application } from "pixi.js";
import Field from "./gameObjects/Field";
import GameClient from './GameClient';
import { GridSettings } from "../lib/GridSettings";
import { FieldChangeAction } from './GameClient';
import { GameState } from "../models";
import { UiStateDispatch } from '../hooks/useUiState';

const beginGameLoop = (app: Application, initialGameState: GameState | undefined, gameClient: GameClient, dispatchUiState: UiStateDispatch) => {
    const fields: Field[] = [];

    const clearFields = () => {
        fields.forEach(field => field.destroy());
        fields.length = 0;
    }

    const handleGameChangeAction = (action: FieldChangeAction, gameClient: GameClient) => {
        if (action.type === 'gameState') {
            clearFields();
            if (action.kind === 'create' || action.kind === 'update') {
                for (let i = 0; i < action.gameState.fields.length; i++) {
                    const fieldModel = action.gameState.fields[i];

                    const field = new Field(app, gameClient, fieldModel);
                    field.container.position.x = i * (fieldModel.map.size.width * GridSettings.tileSize + GridSettings.tileSize * 2);
                    fields.push(field);
                }
            }
        } else if (action.type === 'state') {
            
        } else {
            const fieldId = action.fieldId;

            const field = fields.find(field => field.id === fieldId);

            if (field === undefined) {
                console.error('Unknown field: ' + fieldId);
                return;
            }

            console.log('handlingFieldEvent', { fieldId, action });

            field.handleGameChangeAction(action);
        }
    }

    // const gameClient = new GameClient(handleGameChangeAction);
    gameClient.fieldUpdateDispatch = handleGameChangeAction;
    
    if (initialGameState !== undefined)
        handleGameChangeAction({ type: 'gameState', kind: 'create', gameState: initialGameState }, gameClient);
    
    // for (let i = 0; i < initialGameState.fields.length; i++) {
    //     const fieldModel = initialGameState.fields[i];

    //     const field = new Field(app, gameClient, fieldModel);
    //     field.container.position.x = i * (fieldModel.map.size.width * GridSettings.tileSize + GridSettings.tileSize * 2);
    //     fields.push(field);
    // }

    // gameClient.fieldUpdateDispatch = (action: FieldChangeAction) => {
    //     const fieldId = action.fieldId;

    //     const field = fields.find(field => field.id === fieldId);

    //     if (field === undefined) {
    //         console.error('Unknown field: ' + fieldId);
    //         return;
    //     }

    //     console.log('handlingFieldEvent', { fieldId, action });

    //     field.handleGameChangeAction(action);
    // }

    app.ticker.add((delta) => {
        for (const field of fields) {
            field.update(delta, app.ticker.deltaMS);
        }
    });

    // return {
    //     gameClient,

    //     end: () => {
    //         gameClient.end();
    //     }
    // }
}

export default beginGameLoop;