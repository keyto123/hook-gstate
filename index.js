import { useEffect, useState } from 'react';
import dotProp from 'dot-prop-immutable';

let gState = {};

const subscriptionsHash = {};

const sub = {
    subscriptions: [],
    subscribe: function(keysAndPath, update) {
        this.subscriptions.push({keysAndPath, update});
        keysAndPath.forEach(function(kp) {
            const path = kp[1];
            if(path) {
                if(!subscriptionsHash[path]) {
                    subscriptionsHash[path] = [];
                }
                subscriptionsHash[path].push({keysAndPath, update});
            }
        });
        return this.subscriptions.length - 1;
    },
    unsubscribe: function(index) {
        const _sub = this.subscriptions[index];
        _sub.keysAndPath.forEach(function(kp) {
            subscriptionsHash[kp[1]] = subscriptionsHash[kp[1]].filter(function(sub2) {
                return sub2.update !== _sub.update;
            });
            if(subscriptionsHash[kp[1]].length === 0) {
                delete subscriptionsHash[kp[1]];
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

                sub.keysAndPath.forEach(kp => {
                    update[kp[0]] = dotProp.get(gState, kp[1]);
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

export function update(kvs) {
    const updateKeys = [];
    kvs.forEach(function(kv) {
        if(dotProp.get(gState, kv[0]) === undefined) {
            throw new Error('Trying to create new state variable');
        }
        gState = dotProp.set(gState, kv[0], kv[1]);
        updateKeys.push(kv[0]);
    });
    sub.update(updateKeys);
}

export function useSub(baseKey, keysAndPath) {
    const mKeysAndPath = keysAndPath.map(kp => [kp[0], `${baseKey}.${kp[1]}`]);

    const stateGet = {};
    mKeysAndPath.forEach(function(kp) {
        if(dotProp.get(gState, kp[1]) === undefined) {
            throw new Error('Trying to create new state variable');
        }
        stateGet[kp[0]] = dotProp.get(gState, kp[1]);
    });

    const [state, update] = useState(stateGet);
    useEffect(function() {
        const index = sub.subscribe(mKeysAndPath, update);
        return function() {
            sub.unsubscribe(index);
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