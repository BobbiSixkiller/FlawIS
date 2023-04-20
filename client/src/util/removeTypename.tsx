type Data = { [key: string]: any } | null | undefined;

export default function removeTypename(obj: Data): Data {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  }

  if (typeof obj === "object") {
    const newObj: Data = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key !== "__typename") {
        newObj[key] = removeTypename(value);
      }
    }
    return newObj;
  }

  return obj;
}
