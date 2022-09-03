interface AddedPlayerModel {
    fieldId: number;
    key: string;
    gameId: string;
}

namespace AddedPlayerModel {
    export function fromJSON(json: any): AddedPlayerModel {
        return {
            fieldId: json.fieldId,
            key: json.key,
            gameId: json.gameId,
        };
    }
}

export default AddedPlayerModel;