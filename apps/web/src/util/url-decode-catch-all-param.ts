export function urlDecodeCatchAllParam(param: string[]): string {
  const canonicalParam = param.join(encodeURIComponent("/"));
  return decodeURIComponent(canonicalParam);
}
