import Script from "./Script";
import Transform from "./scripts/Transform";

export default class GameObject {
    scripts: Script[];
    transform: Transform;

    constructor() {
        this.scripts = [];
        this.transform = new Transform(this);
    }
}