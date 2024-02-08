/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "*.svg" {
  const content: any;
  export const ReactComponent: any;
  // eslint-disable-next-line import/no-default-export
  export default content;
}
