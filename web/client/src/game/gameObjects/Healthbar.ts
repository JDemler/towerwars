import { Application, Graphics } from "pixi.js";
import { GridSettings } from '@grid';
import { GameObject } from "@gameObjects";

export default class Healthbar extends GameObject {
    currentHealth: number;
    maxHealth: number;

    outerHealthBarGraphics: Graphics;
    innerHealthBarGraphics: Graphics;
    innerHealthBarBackgroundGraphics: Graphics;
    
    healthBarWidth = GridSettings.tileSize * 0.8;
    healthBarHeight = GridSettings.tileSize * 0.15;
    healthBarPadding = GridSettings.tileSize * 0.025;

    innerHealthbarWidth = this.healthBarWidth - this.healthBarPadding * 2;
    innerHealthbarHeight = this.healthBarHeight - this.healthBarPadding * 2;

    get currentInnerHealthBarWidth() {
        return this.innerHealthbarWidth * (this.currentHealth / this.maxHealth);
    }

    constructor(app: Application, currentHealth: number, maxHealth: number) {
        super(app);

        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;

        // Outer healthbar
        this.outerHealthBarGraphics = new Graphics()
            .beginFill(0xffffff)
            .drawRect(0, 0, this.healthBarWidth, this.healthBarHeight)
            .endFill();
        this.outerHealthBarGraphics.zIndex = 2;
        this.outerHealthBarGraphics.pivot.set(this.healthBarWidth / 2, this.healthBarHeight / 2);
        this.outerHealthBarGraphics.visible = this.currentHealth !== this.maxHealth;
        
        // Inner healthbar Background
        this.innerHealthBarBackgroundGraphics = new Graphics()
            .beginFill(0x464E51)
            .drawRect(0, 0, this.currentInnerHealthBarWidth, this.innerHealthbarHeight)
            .endFill();

        this.innerHealthBarBackgroundGraphics.position.set(this.healthBarPadding, this.healthBarPadding);

        this.outerHealthBarGraphics.addChild(this.innerHealthBarBackgroundGraphics);
        
        // Inner healthbar
        this.innerHealthBarGraphics = new Graphics()
            .beginFill(0xff0000)
            .drawRect(0, 0, this.currentInnerHealthBarWidth, this.innerHealthbarHeight)
            .endFill();

        this.innerHealthBarGraphics.position.set(this.healthBarPadding, this.healthBarPadding);

        this.outerHealthBarGraphics.addChild(this.innerHealthBarGraphics);
    }

    onUpdate(delta: number, deltaMs: number): void {
        
    }

    onDestroy(): void {
        this.outerHealthBarGraphics.destroy();
    }

    updateHealth(currentHealth: number, maxHealth: number) {
        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;
        
        this.innerHealthBarGraphics.width = this.currentInnerHealthBarWidth;
        this.outerHealthBarGraphics.visible = this.currentHealth !== this.maxHealth;
    }
}
