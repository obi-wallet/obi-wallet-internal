import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

import { useStore } from "../../../contexts";
import { Loader } from "../loader";

export const BroadcastingAnimation = observer(function BroadcastingAnimation() {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  const theme = useTheme();

  return (
    <Loader
      loadingText="Broadcasting"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        position: "absolute",
        backgroundColor: isLoop ? "#100F1D" : theme.colors.background,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 50,
        marginTop: -150,
      }}
      animation={require("../assets/broadcast.json")}
      animationStyles={{
        width: 300,
        height: 300,
        maxHeight: "100%",
        maxWidth: "100%",
      }}
    />
  );
});
