import { Graphics, IPointData } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

export function isAbsoluteUrl(url: string): boolean {
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

export type Constructor<T> = new (...args: any[]) => T;


// Probably does not belong here but solves problems :)
// Come on Jakob, you can do better than this! (Copilot recommended this)
declare global {
    interface Window {
        _env_: any;
    }
}

export function handleViewportClick(graphics: Graphics, viewport: Viewport) {
    let globalStartPoint: IPointData | null = null;
    const clickDistanceThreshold = 10;

    graphics.on('pointerdown', e => {
        globalStartPoint = viewport.toGlobal(e.data.global);
    });

    graphics.on('pointerup', e => {
        if (globalStartPoint === null) {
            console.warn('pointerup fired without pointerdown');
            return;
        }

        // Check if the pointerup event is close enough to the pointerdown event
        const globalEndPoint = viewport.toGlobal(e.data.global);

        const distance = Math.sqrt(Math.pow(globalEndPoint.x - globalStartPoint.x, 2) + Math.pow(globalEndPoint.y - globalStartPoint.y, 2));

        globalStartPoint = null;
        
        // If the pointerup event is close enough to the pointerdown event, treat it as a click. Otherwise it is a drag.
        if (distance > clickDistanceThreshold)
            return;

        graphics.emit('viewportClick', e);
    });
}