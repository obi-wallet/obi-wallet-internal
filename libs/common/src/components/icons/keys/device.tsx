import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const DeviceKeyIcon = observer<SvgProps>(function DeviceKeyIcon(props) {
  return (
    <Svg width={21.459} height={21.459} {...props}>
      <G data-name="Interface-Essential / FaceID / face-id">
        <G
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          data-name="Group 98"
        >
          <Path
            d="M1 6.076V3.538A2.538 2.538 0 0 1 3.538 1h2.538"
            data-name="Shape 614"
          />
          <Path
            d="M20.459 6.076V3.538A2.538 2.538 0 0 0 17.921 1h-2.538"
            data-name="Shape 615"
          />
          <Path
            d="M1 15.383v2.538a2.538 2.538 0 0 0 2.538 2.538h2.538"
            data-name="Shape 616"
          />
          <Path
            d="M20.459 15.383v2.538a2.538 2.538 0 0 1-2.538 2.538h-2.538"
            data-name="Shape 617"
          />
          <Path
            d="M11.152 7.345v3.807a1.269 1.269 0 0 1-1.269 1.269H9.46"
            data-name="Shape 618"
          />
          <Path d="M6.922 7.345V9.46" data-name="Shape 619" />
          <Path d="M15.383 7.345V9.46" data-name="Shape 620" />
          <Path
            d="M7.542 14.959a4.636 4.636 0 0 0 6.374 0"
            data-name="Shape 621"
          />
        </G>
      </G>
    </Svg>
  );
});
