import { Application } from "pixi.js";
import { Constructor } from "@helpers";
import { Viewport } from 'pixi-viewport';
import GameClient from '@game/GameClient';
import { UiStateDispatch } from '@hooks';
import { GameInfo } from "@game/GameEntryPoint";

export interface IGameObjectProps {
    app: Application;
    viewport: Viewport;
    gameClient: GameClient;
    gameInfo: GameInfo;
    dispatchUiState: UiStateDispatch;
}

export default abstract class GameObject {
    protected app: Application;
    protected viewport: Viewport;
    protected gameClient: GameClient;
    protected gameInfo: GameInfo;
    protected dispatchUiState: UiStateDispatch;
    
    protected get props(): IGameObjectProps {
        return {
            app: this.app,
            viewport: this.viewport,
            gameClient: this.gameClient,
            gameInfo: this.gameInfo,
            dispatchUiState: this.dispatchUiState,
        }
    }

    public children: GameObject[] = [];

    constructor(props: IGameObjectProps) {
        this.app = props.app;
        this.viewport = props.viewport;
        this.gameClient = props.gameClient;
        this.gameInfo = props.gameInfo;
        this.dispatchUiState = props.dispatchUiState;
    }

    // #region Game Lifecycle Functions
    
    public update(delta: number, deltaMs: number) {
        this.onUpdate?.(delta, deltaMs);
        this.children.forEach(child => child.update(delta, deltaMs));
    }

    public createChild(child: GameObject) {
        this.children.push(child);
    }

    public destroyChild(child: GameObject) {
        this.children = this.children.filter(c => c !== child);
        child.destroy();
    }

    public destroy() {
        this.onDestroy?.();
        this.children.forEach(child => child.destroy());
    }

    protected onUpdate?(delta: number, deltaMs: number): void;

    protected onDestroy?(): void;


    // #endregion
    // #region Children Functionality

    public getChild<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .find(child => child instanceof type) as T | undefined
    }
    
    public getChildren<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .filter(child => child instanceof type)
            .map(child => child as T)
    }

    // #endregion
}
