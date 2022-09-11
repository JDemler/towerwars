import { Application } from "pixi.js";
import { Constructor } from "@helpers";
import { Viewport } from 'pixi-viewport';
import GameClient from '@game/GameClient';
import { UiStateContextAction } from '../../hooks/useUiState';

export interface IGameObjectProps {
    app: Application;
    viewport: Viewport;
    gameClient: GameClient;
    dispatchUiState: React.Dispatch<UiStateContextAction>;
}

export default abstract class GameObject {
    app: Application;
    viewport: Viewport;
    gameClient: GameClient;
    dispatchUiState: React.Dispatch<UiStateContextAction>;

    get props(): IGameObjectProps {
        return {
            app: this.app,
            viewport: this.viewport,
            gameClient: this.gameClient,
            dispatchUiState: this.dispatchUiState,
        }
    }

    children: GameObject[] = [];

    constructor(props: IGameObjectProps) {
        this.app = props.app;
        this.viewport = props.viewport;
        this.gameClient = props.gameClient;
        this.dispatchUiState = props.dispatchUiState;
    }

    update(delta: number, deltaMs: number) {
        this.onUpdate(delta, deltaMs);
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
        this.onDestroy();
        this.children.forEach(child => child.destroy());
    }

    abstract onUpdate(delta: number, deltaMs: number): void;

    abstract onDestroy(): void;

    
    public getChild<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .find(child => child instanceof type) as T | undefined
    }
    
    public getChildren<T extends GameObject>(type: Constructor<T>) {
        return this.children
            .filter(child => child instanceof type)
            .map(child => child as T)
    }
}
