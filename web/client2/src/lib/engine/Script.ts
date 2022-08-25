export default class Script {
    enabled: boolean;

    constructor() {
        this.enabled = true;
    }
    
    update(deltaTime: number) {
        if (!this.enabled) {
            return;
        }
        this.onUpdate(deltaTime);
    }

    onUpdate(deltaTime: number) {
        // override me
    }
}