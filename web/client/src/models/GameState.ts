import { FieldModel } from '@models';

interface GameState {
    fields: FieldModel[];
    elapsed: number;
    incomeCooldown: number;
    state: "WaitingForPlayers" | "Playing" | "GameOver";
}

namespace GameState {
    export function fromJSON(json: any): GameState {
        return {
            fields: json.fields.map((jsonField: any) => FieldModel.fromJSON(jsonField)),
            elapsed: json.elapsed,
            incomeCooldown: json.incomeCooldown,
            state: json.state,
        }
    }

    export const testVar: number = 0;
}

export default GameState;