export function isAbsoluteUrl(url: string): boolean {
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

export type Constructor<T> = new (...args: any[]) => T;


// Probably does not belong here but solves problems :)
declare global {
    interface Window {
        _env_: any;
    }
}