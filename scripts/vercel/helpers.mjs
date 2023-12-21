export function configureBuild({ enabled }) {
  return process.exit(enabled ? 1 : 0);
}
