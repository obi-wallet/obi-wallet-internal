import { observer } from "mobx-react-lite";
import warning from "tiny-warning";

export interface PromptAnimationProps {
  loop: boolean | undefined;
}

export const PromptAnimation = observer<PromptAnimationProps>(
  function PromptAnimation() {
    warning(false, "PromptAnimation is not implemented for web");
    return null;
  }
);
