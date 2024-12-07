// Mock for lottie-react
export function Lottie() {
  return null;
}

export const useLottie = () => {
  return {
    View: () => {
      return null;
    },
    play: () => {},
    stop: () => {},
    pause: () => {},
    setSpeed: () => {},
    goToAndStop: () => {},
    goToAndPlay: () => {},
    setDirection: () => {},
    playSegments: () => {},
    setSubframe: () => {},
    getDuration: () => {
      return 0;
    },
    destroy: () => {},
  };
};
