interface AddedPlayerModel {
    fieldId: number;
    key: string;
}

namespace AddedPlayerModel {
    export function fromJSON(json: any): AddedPlayerModel {
        return {
            fieldId: json.fieldId,
            key: json.key,
        };
    }
}

export default AddedPlayerModel;