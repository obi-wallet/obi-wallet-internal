import { Preview } from "@storybook/react";
import { Buffer } from "buffer/";

import { Container } from "../src/container";
import { Provider } from "../src/provider";

// @ts-expect-error That's fine
global.Buffer = global.Buffer ?? Buffer;

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <Container>
          <Provider env={process.env}>
            <Story />
          </Provider>
        </Container>
      );
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default preview;
