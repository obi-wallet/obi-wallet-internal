import { observer } from "mobx-react-lite";
import Svg, { Path, SvgProps } from "react-native-svg";

export const SendIcon = observer(function SendIcon(
  props: SvgProps & { color?: string }
) {
  const getColor = () => {
    if (props.color) {
      return props.color;
    }

    return "#fff";
  };

  return (
    <Svg width={28} height={28} fill="none" viewBox="0 0 28 28" {...props}>
      <Path
        d="m8.296 6.953 10.523-3.511c4.725-1.575 7.292 1.003 5.729 5.728l-3.512 10.523c-2.357 7.082-6.23 7.082-8.587 0l-1.038-3.126-3.127-1.039c-7.07-2.345-7.07-6.206.012-8.575Z"
        fill={getColor()}
      />
      <Path d="m14.14 13.569 4.444-4.457-4.445 4.457Z" fill="#292D32" />
      <Path
        opacity={0.6}
        d="M14.14 14.444a.865.865 0 0 1-.62-.257.88.88 0 0 1 0-1.237l4.434-4.456a.88.88 0 0 1 1.237 0 .88.88 0 0 1 0 1.236l-4.433 4.457a.917.917 0 0 1-.619.257Z"
        fill="#0C0F1E"
      />
    </Svg>
  );
});
