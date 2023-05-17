import { useStore } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { Back } from "./back";
import { Background } from "./background";
import { ScreenContainer, ScreenContainerProps } from "./screen-container";

export const OnboardingScreenContainer = observer<ScreenContainerProps>(
  function OnboardingScreenContainer({ children, style }) {
    const { configStore } = useStore();
    const screenContainerStyle = configStore.isLoop()
      ? {
          backgroundColor: "transparent",
        }
      : undefined;

    return (
      <>
        <Background />
        <ScreenContainer style={[screenContainerStyle, style]}>
          <Back
            style={{
              marginLeft: -5,
              padding: 5,
              width: 25,
            }}
          />
          {children}
        </ScreenContainer>
      </>
    );
  }
);
