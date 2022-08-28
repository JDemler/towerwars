import { Application } from "pixi.js";
import { Tower } from "./gameObjects/Field";
import GameClient from './GameClient';

const beginGameLoop = (app: Application) => {

    const tower = new Tower(app);

    app.ticker.add((delta) => {
        tower.update(delta);
    });

    const gameClient = new GameClient((action) => {
        console.log(action);
    });

    return {
        gameClient,

        end: () => {
            gameClient.end();
        }
    }
}

export default beginGameLoop;