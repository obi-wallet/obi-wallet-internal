import { Global, Theme } from "@emotion/react";
import { ReactNode } from "react";
// @ts-expect-error internal import w/o types
import { render } from "react-native-web";
import root from "react-shadow/emotion";
import "./app.css";

// eslint-disable-next-line mobx/missing-observer
export function Container({
  children,
  theme,
}: {
  children: ReactNode;
  theme: Theme;
}) {
  console.log({ theme });
  return (
    <>
      <root.div>
        <Global
          styles={{
            ":host": {
              all: "initial",
              width: "390px",
              height: "844px",
              maxWidth: "100vw",
              maxHeight: "100vh",
              display: "flex",
              overflow: "hidden",
              ...theme.modal,
            },
          }}
        />
        <div
          style={{ display: "flex", flex: 1 }}
          ref={(container) => {
            if (!container) return;
            render(children, container);
          }}
        />
      </root.div>
      {/* This doesn't work inside the shadow dom */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&display=swap');
        @font-face {
            font-family: 'Sci Fi Bronze';
            src: url('/fonts/SciFiBronze/SciFiBronze-Regular.eot');
            src: local('Sci Fi Bronze'), local('SciFiBronze-Regular'),
                url('/fonts/SciFiBronze/SciFiBronze-Regular.eot?#iefix') format('embedded-opentype'),
                url('/fonts/SciFiBronze/SciFiBronze-Regular.woff2') format('woff2'),
                url('/fonts/SciFiBronze/SciFiBronze-Regular.woff') format('woff'),
                url('/fonts/SciFiBronze/SciFiBronze-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
      `}
      </style>
    </>
  );
}
