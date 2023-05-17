import { Global } from "@emotion/react";
import root from "react-shadow/emotion";

// eslint-disable-next-line mobx/missing-observer
export function Modal() {
  return (
    <root.div>
      <Global
        styles={{
          ":host": {
            all: "initial",
          },
        }}
      />
      Modal
    </root.div>
  );
}
