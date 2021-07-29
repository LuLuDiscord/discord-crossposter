import type { IDispose } from './dispose';

export function using<T extends IDispose>(instance: T, callback: (instance: T) => void) {
    try {
        callback(instance);
    } finally {
        instance.dispose();
    }
}
