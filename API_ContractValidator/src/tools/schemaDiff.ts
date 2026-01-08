export function compareSchemas(
  oldSchema: any,
  newSchema: any,
  context: string,
  changes: string[],
  path: string = ""
) {
  if (!oldSchema || !newSchema) return;

  const oldProps = oldSchema.properties || {};
  const newProps = newSchema.properties || {};

  // Removed fields
  for (const key in oldProps) {
    if (!newProps[key]) {
      changes.push(`${context}: field removed → ${path}${key}`);
      continue;
    }

    // Type change
    const oldType = oldProps[key].type;
    const newType = newProps[key].type;

    if (oldType !== newType) {
      changes.push(
        `${context}: type changed → ${path}${key} (${oldType} → ${newType})`
      );
    }

    // Required → optional
    const oldReq = oldSchema.required?.includes(key);
    const newReq = newSchema.required?.includes(key);

    if (oldReq && !newReq) {
      changes.push(
        `${context}: field became optional → ${path}${key}`
      );
    }

    // Recursive object check
    if (oldType === "object" && newType === "object") {
      compareSchemas(
        oldProps[key],
        newProps[key],
        context,
        changes,
        `${path}${key}.`
      );
    }
  }
}
