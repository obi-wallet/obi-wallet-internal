import type { Preview } from "@storybook/react";

import "../src/app/globals.css";
import Provider from "../src/components/provider";

const preview: Preview = {
  parameters: {
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
        <Provider>
          <Story />
        </Provider>
      );
    },
  ],
};

export default preview;
