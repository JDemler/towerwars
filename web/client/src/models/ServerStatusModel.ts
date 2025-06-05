export interface GameStatusModel {
    players: number;
    duration: number;
    mobsSent: number;
    towersBuilt: number;
}

interface ServerStatusModel {
    openGames: number;
    runningGames: number;
    gameStatus: { [gameId: string]: GameStatusModel };
}

namespace ServerStatusModel {
    export function fromJSON(json: any): ServerStatusModel {
        const gameStatus: { [gameId: string]: GameStatusModel } = {};
        for (const key in json.gameStatus) {
            if (Object.prototype.hasOwnProperty.call(json.gameStatus, key)) {
                const value = json.gameStatus[key];
                gameStatus[key] = {
                    players: value.players,
                    duration: value.duration,
                    mobsSent: value.mobsSent,
                    towersBuilt: value.towersBuilt,
                };
            }
        }
        return {
            openGames: json.openGames,
            runningGames: json.runningGames,
            gameStatus,
        };
    }
}

export default ServerStatusModel;
export type { GameStatusModel };
