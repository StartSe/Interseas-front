export function sanitizeJson<T>(json: T): T {
  const sanitizedJson = json;
  for (const key in sanitizedJson) {
    const keyValue = sanitizedJson[key];

    if (isObject(keyValue)) {
      sanitizedJson[key] = sanitizeJson(keyValue);
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

  return ['n/a', 'null', 'undefined', ''].includes(keyValue.toLowerCase());
}
