# hook-gstate
A global state manager which associate paths to be used as dependecy levels, only updating components which are linked to the path changed

The key idea here is that the lib will take care of rendering only who needs to render
the most optimized way in terms of processing using a little more memory for a more direct
value to component interaction

Visit https://github.com/keyto123/hook-gstate-example for a little more complete example

## Important
Whenever using path, must be a dot-prop-immutable path.
path's example: 'object1.field', 'object1.object2.field', 'array.0'

Since it's still in it's first steps, i appreciate every information that you can tell me.
Please provide informations about bugs or any issue you find.
If you feel some features are left out, tell me too!
If willing to contribute, feel free to share your knowledge.

## Little example
It may be wise to export your actions if you plan to use them as side effects
for another actions

### Store
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
        update({
            'random.value': newValue
        });
    }
}

// keysAndPath represents the state definition the component will like to receive
// an example is {'myRandom': 'random.value'}
export default function useRandom(keysAndPath) {
    return [
        useSub('random', keysAndPath),
        actions
    ]
}
```

Key map is the object used to give you state stored at path (value)
and storing at key (myRandom)

A good practice is to always give the same keyMapping for the same instance of the component
So store it's value globally for fixed keyMap or use useMemo for dynamic keyMap

why?

Because getting the first set of mapping inside the lib is expensive if done excessively
so avoiding the same thing being done every render is a great thing, right?

### Component
MyComponent.js
```js{4-5}
import React, { useCallback } from 'react';
import useRandom from './useRandom';

// For constant key mapping, create it as global
const keyMap = { 'myRandom': 'value' }

function MyComponent(props) {
    const [{myRandom}, {changeValue}] = useRandom(keyMap);

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