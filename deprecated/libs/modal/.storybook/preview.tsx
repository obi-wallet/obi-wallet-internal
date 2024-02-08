import "../src/shim";

import {
  Config,
  obiModalConfig,
  osmosisModalConfig,
  vertexModalConfig,
  ztxModalConfig,
} from "@obi-wallet/config";
import { Preview } from "@storybook/react";

import { Container, Provider } from "../src";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      if (context.id === "modal--primary") {
        return renderStoryWithContainer(osmosisModalConfig);
      }
      if (context.id === "modal--ztx") {
        return renderStoryWithContainer(ztxModalConfig);
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
            {renderStoryWithContainer(vertexModalConfig)}
          </div>
        );

      // Side-by-side view with different themes
      return (
        <div style={{ display: "flex" }}>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(osmosisModalConfig)}
          </div>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(obiModalConfig)}
          </div>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(vertexModalConfig)}
          </div>
          <div style={{ padding: 5 }}>
            {renderStoryWithContainer(ztxModalConfig)}
          </div>
        </div>
      );

      function renderStoryWithContainer(config: Config) {
        return (
          <Container theme={config.theme}>
            <Provider env={process.env} config={config}>
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
