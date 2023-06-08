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
      if (context.id === "modal--primary") {
        return renderStoryWithContainer(osmosisTheme);
      }

      if (context.id === "modal--vertex")
        return (
          <div
            style={{
              position: "fixed",
              top: 5,
              right: 5,
            }}
          >
            {renderStoryWithContainer(vertexTheme)}
          </div>
        );

      // Side-by-side view with different themes
      return (
        <div style={{ display: "flex" }}>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(osmosisTheme)}
          </div>
          <div style={{ padding: 5 }}>{renderStoryWithContainer(obiTheme)}</div>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(vertexTheme)}
          </div>
        </div>
      );

      function renderStoryWithContainer(theme: CustomTheme) {
        return (
          <Container theme={theme}>
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
