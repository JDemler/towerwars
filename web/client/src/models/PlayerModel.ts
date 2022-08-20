interface PlayerModel {
    id: number;
    name: string;
    money: number;
    income: number;
    lives: number;
}

namespace PlayerModel {
    export function fromJSON(json: any): PlayerModel {
        return {
            id: json.id,
            name: json.name,
            money: json.money,
            income: json.income,
            lives: json.lives,
        };
    }
}

export default PlayerModel;