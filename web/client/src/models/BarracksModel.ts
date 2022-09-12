export interface MobSlotModel {
    mobKey: string;
    count: number;
    respawn: number;
}

interface BarracksModel {
    id: number;
    mobSlots: MobSlotModel[];
}

namespace BarracksModel {
    export function fromJSON(json: any): BarracksModel {
        return {
            id: json.id,
            mobSlots: json.mobSlots.map((slot: any) => ({
                mobKey: slot.mob,
                count: slot.count,
                respawn: slot.respawn,
            } as MobSlotModel)),
        };
    }
}

export default BarracksModel;