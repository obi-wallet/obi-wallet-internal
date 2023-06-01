import { observer } from "mobx-react-lite";

import { useStore } from "../../contexts";
import { OsmosisScreenContainer } from "../osmosis-screen-container";
import { ScreenContainer, ScreenContainerProps } from "../screen-container";

export const OnboardingScreenContainer = observer<ScreenContainerProps>(
  function OnboardingScreenContainer({ children, style }) {
    const { configStore } = useStore();
    const screenContainerStyle = configStore.isLoop()
      ? {
          backgroundColor: "transparent",
        }
      : undefined;

    return (
      <OsmosisScreenContainer>
        <ScreenContainer style={[screenContainerStyle, style]}>
          {children}
        </ScreenContainer>
      </OsmosisScreenContainer>
    );
  }
);
