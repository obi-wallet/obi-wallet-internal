import type { Preview } from "@storybook/react";

import "../src/app/globals.css";
import { MainContainer, RootContainer } from "@/app/layout";
import Provider from "@/components/provider";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    actions: { argTypesRegex: "^on[A-Z].*" },
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
