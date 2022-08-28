import { Application } from "pixi.js";
import Field, { Tower } from "./gameObjects/Field";
import GameClient, { GameChangeAction } from './GameClient';

const beginGameLoop = (app: Application) => {
    // const tower = new Tower(app);

    // app.ticker.add((delta) => {
    //     tower.update(delta);
    // });

    const fields: Field[] = [];

    const clearFields = () => {
        fields.forEach(field => field.destroy());
        fields.length = 0;
    }

    const handleGameChangeAction = (action: GameChangeAction) => {
        if (action.type === 'gameState') {
            clearFields();
            if (action.kind === 'create' || action.kind === 'update') {
                for (const fieldModel of action.gameState.fields) {
                    const field = new Field(app, fieldModel);
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

    const gameClient = new GameClient(handleGameChangeAction);
    
    app.ticker.add((delta) => {
        for (const field of fields) {
            field.update(delta);
        }
    });

    return {
        gameClient,

        end: () => {
            gameClient.end();
        }
    }
}

export default beginGameLoop;