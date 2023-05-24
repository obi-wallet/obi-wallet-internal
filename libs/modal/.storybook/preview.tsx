import "../src/shim";

import { Preview } from "@storybook/react";

import { Container } from "../src/container";
import { Provider } from "../src/provider";

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

export const parameters = { layout: "fullscreen" };

// eslint-disable-next-line import/no-default-export
export default preview;
