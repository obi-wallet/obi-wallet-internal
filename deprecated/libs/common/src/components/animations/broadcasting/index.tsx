import { observer } from "mobx-react-lite";

import broadcastAnimation from "../assets/broadcast.json";
import { Loader } from "../loader";

export const BroadcastingAnimation = observer(function BroadcastingAnimation() {
  return (
    <Loader
      loadingText="Broadcasting"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 50,
        marginTop: -150,
      }}
      animation={broadcastAnimation}
      animationStyles={{
        width: 300,
        height: 300,
        maxHeight: "100%",
        maxWidth: "100%",
      }}
    />
  );
});
