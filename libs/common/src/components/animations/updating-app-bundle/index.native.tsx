import { observer } from "mobx-react-lite";

import { Loader } from "../loader";

export const UpdatingAppBundleAnimation = observer(
  function UpdatingAppBundleAnimation() {
    return (
      <Loader
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          marginBottom: 150,
        }}
        loadingText="Updating app bundle"
        animation={require("../assets/broadcast.json")}
        animationStyles={{
          width: 300,
          height: 300,
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      />
    );
  }
);
