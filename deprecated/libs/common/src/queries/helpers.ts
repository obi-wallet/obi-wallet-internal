import { Duration, DurationLikeObject } from "luxon";

export function staleTime(duration: DurationLikeObject) {
  return Duration.fromObject(duration).toMillis();
}
