function stringifyObjectValues(obj: Record<string, unknown>): Record<string, string> {
  const stringifiedObject: Record<string, string> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") {
      stringifyObjectValues(obj[key] as Record<string, unknown>);
    }

    stringifiedObject[key] = `${obj[key]}`;
  });
  return stringifiedObject;
}

export default stringifyObjectValues;
