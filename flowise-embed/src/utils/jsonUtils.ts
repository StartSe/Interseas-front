export enum customBooleanValues {
  NOT_FOUND = 'Não consta',
  FOUND = 'Consta',
  FALSE_WITH_JUSTIFICATION = 'Não, ',
}

export function sanitizeJson<T>(json: T): T {
  const sanitizedJson = { ...json };

  for (const key in sanitizedJson) {
    const keyValue = sanitizedJson[key];

    if (isObject(keyValue)) {
      sanitizedJson[key] = sanitizeJson(keyValue);
    } else if (keyValue === 'true' || keyValue === true) {
      (sanitizedJson[key] as any) = customBooleanValues.FOUND;
    } else if (keyValue === 'false' || keyValue === false) {
      (sanitizedJson[key] as any) = customBooleanValues.NOT_FOUND;
    } else if (shouldReplaceWithNull(keyValue)) {
      (sanitizedJson[key] as any) = null;
    }
  }

  return sanitizedJson;
}

function isObject(keyValue: any): boolean {
  return typeof keyValue === 'object' && keyValue !== null;
}

function shouldReplaceWithNull(keyValue: any): boolean {
  if (keyValue === null) {
    return false;
  }

  if (typeof keyValue === 'boolean') {
    return false;
  }

  return ['n/a', 'null', 'undefined', ''].includes(keyValue.toString().toLowerCase());
}

export function sanitizeToFlatArray(input: any): any[] {
  const result: any[] = [];

  function recursiveSanitize(value: any): void {
    if (Array.isArray(value)) {
      value.forEach(recursiveSanitize);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(recursiveSanitize);
    } else if (typeof value === 'string') {
      const sanitized = value.replace(/\D/g, '');
      if (sanitized) {
        result.push(sanitized);
      }
    } else if (typeof value === 'number') {
      value = value.toString().replace(/\D/g, '');
      result.push(value);
    }
  }

  recursiveSanitize(input);
  return result;
}

export const compareAndMergeArrays = (firstArray: any[], secondArray: any[]): any[] => {
  if (!firstArray) {
    return secondArray;
  }
  if (!secondArray) {
    return firstArray;
  }
  const mergedArray = [...firstArray];

  for (const item of secondArray) {
    if (!mergedArray.includes(item)) {
      mergedArray.push(item);
    }
  }

  return mergedArray;
};

export const isNonEmptyArrayOrObject = (value: any): boolean => {
  if (Array.isArray(value)) {
    return value.length > 0;
  } else if (value && typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return value !== null;
};
