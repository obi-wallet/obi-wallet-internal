import "../src/shim";

import {
  CustomTheme,
  obiTheme,
  osmosisTheme,
  vertexTheme,
} from "@obi-wallet/theme";
import { Preview } from "@storybook/react";

import { Container } from "../src/container";
import { Provider } from "../src/provider";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      if (context.id === "modal--primary") return renderStory();

      // Side-by-side view with different themes
      return (
        <div style={{ display: "flex" }}>
          <div style={{ padding: 5 }}>{renderStory(osmosisTheme)}</div>
          <div style={{ padding: 5 }}>{renderStory(obiTheme)}</div>
          <div style={{ padding: 5 }}>{renderStory(vertexTheme)}</div>
        </div>
      );

      function renderStory(theme?: CustomTheme) {
        return (
          <Container>
            <Provider env={process.env} theme={theme}>
              <Story />
            </Provider>
          </Container>
        );
      }
    },
  ],
};

export const parameters = { layout: "fullscreen" };

// eslint-disable-next-line import/no-default-export
export default preview;
