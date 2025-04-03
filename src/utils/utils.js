export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function randomInt(min, max) {
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function compareVersions(minVersion) {
  const current = process.versions.node.split(".").map(Number);
  const required = minVersion.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (current[i] > required[i]) return true;
    if (current[i] < required[i]) return false;
  }
  return true;
}
