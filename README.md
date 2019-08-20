# hook-gstate
A global state manager which associate paths to be used as dependecy levels, only updating components which are linked to the path changed

useRandom.js
```js{4-5}
// State creating
import { createState, useSub, update } from 'hook-gstate';

// Passing a entry 'random' and it's initial value
createState('random', {
    value: Math.random()
});

// Here, update can be used to change multiple values with the style [path, value]
const actions = {
    changeValue: function(newValue) {
        update([
            ['random.value', newValue]
        ]);
    }
}

// keysAndPath represents the state definition the component will like to receive
// an example is [ ['myRandom', 'random.value'] ]
export default function useRandom(keysAndPath) {
    return [
        useSub('random', keysAndPath),
        actions
    ]
}
```

MyComponent.js
```js{4-5}
import React, { useCallback } from 'react';
import useRandom from './useRandom';

function MyComponent(props) {
    const [{myRandom}, {changeValue}] = useRandom([ ['myRandom', 'value'] ]);

    const handleChange = useCallback(function() { changeValue(Math.random()); }, [changeValue]);

    return (
        <div>
            My random value: {myRandom}
            <button onClick={handleChange}>Change random value</button>
        </div>
    );
}

export default MyComponent;
```