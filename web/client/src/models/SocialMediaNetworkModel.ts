interface SocialMediaNetworkModel {
    name: string;
    description: string;
    key: string;
}


namespace SocialMediaNetworkModel {
    export function fromJSON(json: any): SocialMediaNetworkModel {
        return {
            name: json.name,
            description: json.description,
            key: json.key,
        };
    }
}

export default SocialMediaNetworkModel;