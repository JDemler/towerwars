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