/**
 * Deep merges multiple partial objects into a single object of type T.
 * This function recursively combines all properties from the source objects.
 * Later objects in the argument list take precedence when there are conflicts.
 *
 * Features:
 * - Properly handles nested objects
 * - Arrays are replaced, not merged
 * - Handles null and undefined values
 * - Preserves object references when appropriate
 * - Type-safe with TypeScript generics
 *
 * @param objects - Multiple partial objects to merge
 * @returns A merged object containing all properties from the input objects
 */
export function deepmerge<T extends Record<string, any>>(
  ...objects: Partial<T>[]
): T {
  // Filter out null/undefined objects
  const validObjects = objects.filter((obj) => obj != null);

  // Return empty object if no valid objects were provided
  if (validObjects.length === 0) {
    return {} as T;
  }

  // Return the object if there's only one valid object
  if (validObjects.length === 1) {
    return { ...validObjects[0] } as T;
  }

  // Start with first object as base
  const result = { ...validObjects[0] };
  const prototypeOfArray = Object.getPrototypeOf([]);
  const prototypeOfObject = Object.getPrototypeOf({});

  const isMergable = (o: unknown) =>
    o &&
    typeof o === "object" &&
    Object.getPrototypeOf(o) === prototypeOfObject;

  const isArray = (o: unknown) =>
    Array.isArray(o) && Object.getPrototypeOf(o) === prototypeOfArray;

  // Merge remaining objects
  for (let i = 1; i < validObjects.length; i++) {
    const currentObj = validObjects[i];

    for (const key in currentObj) {
      if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
        const currentValue = currentObj[key];
        const existingValue = result[key];

        // Handle null or undefined values from current object
        if (currentValue === null || currentValue === undefined) {
          result[key] = currentValue;
          continue;
        }

        // If both values are objects and not arrays, recursively merge them
        if (isMergable(existingValue) && isMergable(currentValue)) {
          // @ts-ignore deepmerge
          result[key] = deepmerge(existingValue, currentValue);
        } else {
          // For arrays, functions, primitives, or when existing value is null/undefined,
          // simply replace with current value (with proper cloning)
          if (isArray(currentValue)) {
            // @ts-ignore deepmerge
            result[key] = [...currentValue];
          } else if (isMergable(currentValue)) {
            result[key] = { ...currentValue };
          } else {
            result[key] = currentValue;
          }
        }
      }
    }
  }

  return result as T;
}

/**
 * Type test examples:
 *
 * interface Person {
 *   name: string;
 *   age: number;
 *   address: {
 *     street: string;
 *     city: string;
 *     country: string;
 *   };
 *   hobbies: string[];
 *   metadata?: Record<string, any>;
 * }
 *
 * // Usage:
 * const result = deepmerge<Person>(
 *   { name: 'John', age: 30, address: { street: 'Main St', country: 'USA' }, hobbies: ['reading'] },
 *   { address: { city: 'New York' }, hobbies: ['coding', 'hiking'] }
 * );
 *
 * // Result will be of type Person with all fields properly merged
 */
