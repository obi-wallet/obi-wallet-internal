import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ObiAccountsIcon = observer<SvgProps>(
  function ObiAccountsIcon(props) {
    return (
      <Svg width={30.727} height={30.727} {...props}>
        <G data-name="Interface-Essential / Controls / settings-toggle-horizontal">
          <G
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            data-name="Group 188"
          >
            <Path
              d="M.747 2.021A1.271 1.271 0 0 1 2.018.75h26.689a1.271 1.271 0 0 1 1.271 1.271v26.686a1.271 1.271 0 0 1-1.271 1.271H2.021A1.271 1.271 0 0 1 .75 28.707Z"
              data-name="Rectangle-path 61"
            />
            <Path
              d="M4.558 8.374a3.812 3.812 0 0 0 3.812 3.812h13.978a3.813 3.813 0 0 0 0-7.625H8.37a3.812 3.812 0 0 0-3.812 3.813Z"
              data-name="Shape 994"
            />
            <Path
              d="M4.558 22.353a3.812 3.812 0 0 0 3.812 3.812h13.978a3.813 3.813 0 0 0 0-7.625H8.37a3.812 3.812 0 0 0-3.812 3.813Z"
              data-name="Shape 995"
            />
            <Path
              d="M8.374 12.187a3.812 3.812 0 1 0-3.812-3.812 3.812 3.812 0 0 0 3.812 3.812Z"
              data-name="Oval 162"
            />
            <Path
              d="M22.353 26.166a3.812 3.812 0 1 0-3.812-3.812 3.812 3.812 0 0 0 3.812 3.812Z"
              data-name="Oval 163"
            />
          </G>
        </G>
      </Svg>
    );
  },
);

export const ObiAccountsActiveIcon = observer<SvgProps>(
  function ObiAccountsActiveIcon(props) {
    return (
      <Svg width={30.727} height={30.727} {...props}>
        <G data-name="Interface-Essential / Controls / settings-toggle-horizontal">
          <G
            stroke="#437dff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            data-name="Group 188"
          >
            <Path
              fill="#fff"
              d="M.747 2.021A1.271 1.271 0 0 1 2.018.75h26.689a1.271 1.271 0 0 1 1.271 1.271v26.686a1.271 1.271 0 0 1-1.271 1.271H2.021A1.271 1.271 0 0 1 .75 28.707Z"
              data-name="Rectangle-path 61"
            />
            <Path
              fill="#437dff"
              d="M4.558 8.374a3.812 3.812 0 0 0 3.812 3.812h13.978a3.813 3.813 0 0 0 0-7.625H8.37a3.812 3.812 0 0 0-3.812 3.813Z"
              data-name="Shape 994"
            />
            <Path
              fill="#437dff"
              d="M4.558 22.353a3.812 3.812 0 0 0 3.812 3.812h13.978a3.813 3.813 0 0 0 0-7.625H8.37a3.812 3.812 0 0 0-3.812 3.813Z"
              data-name="Shape 995"
            />
            <Path
              fill="#fff"
              d="M8.374 12.187a3.812 3.812 0 1 0-3.812-3.812 3.812 3.812 0 0 0 3.812 3.812Z"
              data-name="Oval 162"
            />
            <Path
              fill="#fff"
              d="M22.353 26.166a3.812 3.812 0 1 0-3.812-3.812 3.812 3.812 0 0 0 3.812 3.812Z"
              data-name="Oval 163"
            />
          </G>
        </G>
      </Svg>
    );
  },
);
