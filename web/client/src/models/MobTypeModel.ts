interface MobTypeModel {
    name: string;
    description: string;
    key: string;
    health: number;
    speed: number;
    reward: number;
    income: number;
    cost: number;
    respawn: number;
    delay: number;
}

namespace MobTypeModel {
    export function fromJSON(json: any): MobTypeModel {
        return {
            name: json.name,
            description: json.description,
            key: json.key,
            health: Number.parseFloat(json.health),
            speed: Number.parseFloat(json.speed),
            reward: Number.parseFloat(json.reward),
            income: Number.parseFloat(json.income),
            cost: Number.parseFloat(json.cost),
            respawn: Number.parseFloat(json.respawn),
            delay: Number.parseFloat(json.delay),
        }
    }
}

export default MobTypeModel;