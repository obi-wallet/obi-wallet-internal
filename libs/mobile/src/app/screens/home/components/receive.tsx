import { useStore } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import Svg, { Path, SvgProps } from "react-native-svg";

export const ReceiveIcon = observer(function ReceiveIcon(props: SvgProps) {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M19.704 21.047 9.181 24.558c-4.725 1.575-7.292-1.003-5.729-5.728L6.964 8.307c2.357-7.082 6.23-7.082 8.587 0l1.038 3.126 3.127 1.039c7.07 2.345 7.07 6.206-.012 8.575Z"
        fill={isLoop ? "#89F5C2" : "#fff"}
      />
      <Path d="m13.86 14.431-4.444 4.457 4.445-4.457Z" fill="#292D32" />
      <Path
        opacity={0.6}
        d="M13.86 13.556c.223 0 .444.082.62.257a.88.88 0 0 1 0 1.237l-4.434 4.456a.88.88 0 0 1-1.237 0 .88.88 0 0 1 0-1.236l4.434-4.457a.917.917 0 0 1 .618-.257Z"
        fill="#0C0F1E"
      />
    </Svg>
  );
});
