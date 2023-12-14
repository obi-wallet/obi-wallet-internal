import { keys } from "ramda";

export const none = Symbol();

export type None = typeof none;

const PATTERN_KEY = Symbol();

export type PatternKeyType<
  U extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [PATTERN_KEY]: any;
  },
> = U[typeof PATTERN_KEY];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type S = { [key: string]: None | ((...args: any[]) => any) | undefined };

type DataMap<O extends S> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof O]: O[P] extends (...args: any[]) => any
    ? ReturnType<O[P]>
    : O[P] extends None
    ? undefined
    : O[P];
};

type FullVariants<O extends S> = {
  [P in keyof DataMap<O>]: DataMap<O>[P] extends None
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => any
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: DataMap<O>[P]) => any;
};

// This one is for in case we don't need to use option for error reporting
type PartialVariants<O extends S> = Partial<FullVariants<O>> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _: <P extends keyof DataMap<O>>(data: DataMap<O>[P]) => any;
};

type MatchConfig<O extends S> = FullVariants<O> | PartialVariants<O>;

class Matcher implements PatternObj<S> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(variant: any, data?: any) {
    this.variant = variant;
    this.data = data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  match(patterns: any): any {
    const data = this.data;
    const matchingHandler = patterns[this.variant];

    if (matchingHandler) {
      return matchingHandler(data);
    } else if (patterns._) {
      return patterns._(data);
    } else {
      throw new Error(`Match did not handle variant: '${this.variant}'`);
    }
  }
}
Object.defineProperty(Matcher, "name", { value: "PatternObj" });

interface PatternObj<O extends S> {
  match<C extends MatchConfig<O>>(
    patterns: C,
  ): ReturnType<Exclude<C[keyof C], undefined>>;
  variant: keyof O;
  data?: DataMap<O>[keyof O];
}

export type VariantRecord<O extends S> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof O]: O[P] extends (...args: any[]) => any
    ? (...args: Parameters<O[P]>) => PatternObj<O>
    : PatternObj<O>;
} & {
  [PATTERN_KEY]: PatternObj<O>;
};

export function createVariantRecord<O extends S>(
  variants: O,
): VariantRecord<O> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchObj: any = {};

  keys(variants).forEach((matchType) => {
    const variant = variants[matchType];
    if (typeof variant === "function") {
      matchObj[matchType] = (...args: never[]) => {
        return new Matcher(matchType, variant(...args));
      };
    } else {
      matchObj[matchType] = new Matcher(matchType, undefined);
    }
  });

  return matchObj;
}
