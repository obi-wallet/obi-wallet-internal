import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";

import "../src/app/globals.css";
import { MainContainer, RootContainer } from "@/layouts/root";
import Provider from "@/components/provider";

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
        <RootContainer className="bg-gradient-to-br from-black to-slate-900">
          <Provider>
            <MainContainer>
              <Story />
            </MainContainer>
          </Provider>
        </RootContainer>
      );
    },
  ],
};

export default preview;
