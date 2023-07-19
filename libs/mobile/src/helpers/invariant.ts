import invariant from "tiny-invariant";

export function envInvariant(name: string, variable: unknown) {
  invariant(
    variable,
    `Environment variable \`${name}\` is not defined. Is your \`.env\` file up-to-date?`,
  );
}
