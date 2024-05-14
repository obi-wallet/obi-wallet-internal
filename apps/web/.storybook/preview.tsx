import type { Preview } from "@storybook/react";

import "../src/app/globals.css";
import { MainContainer, RootContainer } from "@/layouts/root";
import Provider from "@/components/provider";

const preview: Preview = {
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
