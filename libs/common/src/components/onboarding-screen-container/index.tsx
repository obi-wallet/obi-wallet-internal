import { observer } from "mobx-react-lite";

import { OsmosisScreenContainer } from "../osmosis-screen-container";
import { ScreenContainer, ScreenContainerProps } from "../screen-container";

export const OnboardingScreenContainer = observer<ScreenContainerProps>(
  function OnboardingScreenContainer({ children, style }) {
    return (
      <OsmosisScreenContainer>
        <ScreenContainer style={[style]}>{children}</ScreenContainer>
      </OsmosisScreenContainer>
    );
  }
);
