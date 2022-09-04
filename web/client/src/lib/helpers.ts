export function isAbsoluteUrl(url: string): boolean {
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

export type Constructor<T> = new (...args: any[]) => T;