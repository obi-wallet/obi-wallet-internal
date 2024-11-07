import Provider from "@/components/provider";
import { RootContainer } from "@/layouts/root";
import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";

import "@/app/globals.css";

initialize({ onUnhandledRequest: "warn" });

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => {
      return (
        <RootContainer>
          <Provider>
            <Story />
            <div id="modal-root" />
          </Provider>
        </RootContainer>
      );
    },
  ],
};

export default preview;
