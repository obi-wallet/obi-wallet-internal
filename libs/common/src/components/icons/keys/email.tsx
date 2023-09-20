import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const EmailKeyIcon = observer<SvgProps>(function EmailKeyIcon(props) {
  const theme = useTheme();
  return theme.style === "ztx" ? (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H20C20.55 4 21.0208 4.19583 21.4125 4.5875C21.8042 4.97917 22 5.45 22 6V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM12 13L20 8V6L12 11L4 6V8L12 13Z"
        fill="#F6F8FC"
      />
    </Svg>
  ) : (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path
        d="M2.94 6.412A2 2 0 0 0 2 8.108V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.108a2 2 0 0 0-.94-1.696l-6-3.75a2 2 0 0 0-2.12 0l-6 3.75Zm2.615 2.423a1 1 0 0 0-1.11 1.664l5 3.333a1 1 0 0 0 1.11 0l5-3.333a1 1 0 1 0-1.11-1.664L10 11.798 5.555 8.835Z"
        clipRule="evenodd"
      />
    </Svg>
  );
});
