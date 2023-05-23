import { Global } from "@emotion/react";
import { ReactNode } from "react";
// @ts-expect-error internal import w/o types
import { render } from "react-native-web";
import root from "react-shadow/emotion";

// eslint-disable-next-line mobx/missing-observer
export function Container({ children }: { children: ReactNode }) {
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
              borderRadius: "25px",
              display: "flex",
              overflow: "hidden",
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
        `}
      </style>
    </>
  );
}
