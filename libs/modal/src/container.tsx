import { Global } from "@emotion/react";
import { ReactNode } from "react";
// @ts-expect-error render is only supported by react-native-web
import { render } from "react-native";
import root from "react-shadow/emotion";

// eslint-disable-next-line mobx/missing-observer
export function Container({ children }: { children: ReactNode }) {
  return (
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
  );
}
