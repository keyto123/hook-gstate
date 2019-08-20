import { useEffect, useState } from 'react';
import dotProp from 'dot-prop-immutable';

let gState = {};

const sub = {
    subscriptions: [],
    subscribe: function(keysAndPath, update) { this.subscriptions.push({keysAndPath, update}); return this.subscriptions.length - 1; },
    unsubscribe: function(index) { this.subscriptions = this.subscriptions.filter((s, i) => i !== index) },
    update: function(pathList) {
        this.subscriptions.forEach(subscription => {
            const shouldUpdate = pathList.some(key => subscription.keysAndPath.some(kp => kp[1] === key));

            if(shouldUpdate) {
                let update = {};
                subscription.keysAndPath.forEach(kp => {
                    update[kp[0]] = dotProp.get(gState, kp[1]);
                })

                pathList.forEach(function(key) {
                    const name = subscription.keysAndPath.find(kp => kp[1] === key)[0];
                    update[name] = dotProp.get(gState, key);
                });
                subscription.update(update);
            }
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
        gState = dotProp.set(gState, kv[0], kv[1]);
        updateKeys.push(kv[0]);
    });
    sub.update(updateKeys);
}

export function useSub(keysAndPath) {
    const stateGet = {};
    keysAndPath.forEach(function(kp) {
        stateGet[kp[0]] = dotProp.get(gState, kp[1]);
    });

    const [state, update] = useState(stateGet);
    useEffect(function() {
        const index = sub.subscribe(keysAndPath, update);
        return function() {
            sub.unsubscribe(index);
        }
    }, []);

    return state;
}

export function getState() {
    return JSON.parse(JSON.stringify(gState));
}
