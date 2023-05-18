import { Global } from "@emotion/react";
import { ReactNode } from "react";
// @ts-expect-error internal import w/o types
import { render } from "react-native-web/dist/exports/render";
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
              width: "325px",
              height: "667px",
              display: "flex",
            },
          }}
        />
        <div
          style={{ display: "flex" }}
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
