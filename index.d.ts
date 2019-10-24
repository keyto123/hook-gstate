type kv = [string, any]
type kp = [string, string]

/**
 * Create a new state entry with default values
 * @param key state entry key. Must be defined
 * @param value Initial value of the state entry. Must contain every attribute that should exist at top level
 */
export function createState(key: string, value: object): void | never

/**
 * Function used for updating global state
 * @param kvs array of keys and values [key, value]
 */
export function update(kvs: kv[])

/**
 * Function used to subscribe a component to a set of global state paths
 * @param baseKey state entry key. Must be defined
 * @param kps array of keys and paths [key, path]
 * @returns object with mapped values based on kps
 */
export function useSub(baseKey: string, kps: kp[]): object

/**
 * Returns a deep copy of the global state
 */
export function getState(): object

/**
 * Returns the value of a path in the state
 */
export function getFromPath(path: string): any