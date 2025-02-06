export function toSafeFilename(value: string, replaceValue = "_") {
  return value.replace(/[\/:*?"<>|\\\x00-\x1F]/g, replaceValue);
}
