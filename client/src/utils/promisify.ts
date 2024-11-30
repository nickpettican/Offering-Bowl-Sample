type Unsubscribe = () => void;
type Observer<T> = (callback: (value: T) => void) => Unsubscribe;

export function createPersistentPromise<T>(observer: Observer<T>): Promise<T> {
    return new Promise<T>((resolve) => {
        const unsubscribe = observer((value) => {
            unsubscribe();
            resolve(value);
        });
    });
}

export function promisifyObserver<T>(observer: Observer<T>): Promise<T> {
    return new Promise((resolve) => {
        observer((value) => {
            resolve(value);
        });
    });
}
