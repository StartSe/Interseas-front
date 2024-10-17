export enum customBooleanValues {
  NOT_FOUND = 'Não consta',
  FOUND = 'Consta',
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
