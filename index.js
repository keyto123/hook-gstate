import { useEffect, useState, useMemo } from 'react';
import dotProp from 'dot-prop-immutable';

let gState = {};

const subscriptionsHash = {};

const manager = {
    subscriptions: [],
    subscribe: function(keys, keysAndPath, update) {
        const subscription = {keys, keysAndPath, update};
        this.subscriptions.push(subscription);
        keys.forEach(function(key) {
            const path = keysAndPath[key];
            if(path) {
                if(!subscriptionsHash[path]) {
                    subscriptionsHash[path] = [];
                }
                subscriptionsHash[path].push(subscription);
            }
        });
        return this.subscriptions.length - 1;
    },
    unsubscribe: function(index) {
        const _sub = this.subscriptions[index];
        _sub.keys.forEach(function(key) {
            const path = _sub.keysAndPath[key];
            subscriptionsHash[path] = subscriptionsHash[path].filter(function(sub2) {
                return sub2.update !== _sub.update;
            });
            if(subscriptionsHash[path].length === 0) {
                delete subscriptionsHash[path];
            }
        });
        this.subscriptions = this.subscriptions.filter((s, i) => i !== index)
    },
    update: function(pathList) {
        pathList.forEach(function(path) {
            const subs = subscriptionsHash[path];
            if(!subs) {
                return;
            }
            subs.forEach(function(sub) {
                let update = {};

                sub.keys.forEach(function(key) {
                    const path = sub.keysAndPath[key];
                    update[key] = dotProp.get(gState, path);
                });

                sub.update(update);
            })
        });
    }
}

export function createState(key, value) {
    if(gState[key] !== undefined) {
        throw new Error(`Trying to create state that is already created: ${key}`);
    }
    gState = dotProp.set(gState, `${key}`, value);
}

export function update(pathsAndValues) {
    const updateKeys = [];

    Object.keys(pathsAndValues).forEach(function(path) {
        const value = pathsAndValues[path];
        if(dotProp.get(gState, path) === undefined) {
            throw new Error('Trying to create new state variable');
        }
        gState = dotProp.set(gState, path, value);
        updateKeys.push(path);
    });
    manager.update(updateKeys);
}

function computeState(baseKey, keysAndPath) {
    const mKeysAndPath = {};
    Object.keys(keysAndPath).forEach(function(key) {
        mKeysAndPath[key] = `${baseKey}.${keysAndPath[key]}`;
    });

    const stateGet = {};
    const mKeys = Object.keys(mKeysAndPath);
    mKeys.forEach(function(key) {
        const path = mKeysAndPath[key];
        if(dotProp.get(gState, path) === undefined) {
            throw new Error('Trying to create new state variable');
        }
        stateGet[key] = dotProp.get(gState, path);
    });
    return { mKeys, mKeysAndPath, stateGet };
};

export function useSub(baseKey, keysAndPath) {
    const { mKeys, mKeysAndPath, stateGet } = useMemo(function() {
        return computeState(baseKey, keysAndPath);
    },
        [baseKey, keysAndPath]
    );
    const [state, update] = useState(stateGet);

    useEffect(function() {
        const index = manager.subscribe(mKeys, mKeysAndPath, update);
        return function() {
            manager.unsubscribe(index);
        }
    }, []);

    return state;
}

export function getState() {
    return JSON.parse(JSON.stringify(gState));
}

export function getFromPath(path) {
    return dotProp.get(gState, path);
}