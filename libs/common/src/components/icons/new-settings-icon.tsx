import { observer } from "mobx-react-lite";
import Svg, { G, Path, SvgProps } from "react-native-svg";

export const NewSettingsIcon = observer<
  SvgProps & { color?: string; themeMode?: string }
>(function NewSettingsIcon(props) {
  return props.themeMode === "ztx" ? (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_b_0_1)">
        <rect
          y="52"
          width="52"
          height="52"
          rx="26"
          transform="rotate(-90 0 52)"
          fill="url(#paint0_radial_0_1)"
          fillOpacity="0.5"
        />
        <rect
          x="0.5"
          y="51.5"
          width="51"
          height="51"
          rx="25.5"
          transform="rotate(-90 0.5 51.5)"
          stroke="url(#paint1_linear_0_1)"
        />
      </g>
      <path
        d="M23.2492 36L22.8492 32.8C22.6326 32.7167 22.4284 32.6167 22.2367 32.5C22.0451 32.3833 21.8576 32.2583 21.6742 32.125L18.6992 33.375L15.9492 28.625L18.5242 26.675C18.5076 26.5583 18.4992 26.4458 18.4992 26.3375V25.6625C18.4992 25.5542 18.5076 25.4417 18.5242 25.325L15.9492 23.375L18.6992 18.625L21.6742 19.875C21.8576 19.7417 22.0492 19.6167 22.2492 19.5C22.4492 19.3833 22.6492 19.2833 22.8492 19.2L23.2492 16H28.7492L29.1492 19.2C29.3659 19.2833 29.5701 19.3833 29.7617 19.5C29.9534 19.6167 30.1409 19.7417 30.3242 19.875L33.2992 18.625L36.0492 23.375L33.4742 25.325C33.4909 25.4417 33.4992 25.5542 33.4992 25.6625V26.3375C33.4992 26.4458 33.4826 26.5583 33.4492 26.675L36.0242 28.625L33.2742 33.375L30.3242 32.125C30.1409 32.2583 29.9492 32.3833 29.7492 32.5C29.5492 32.6167 29.3492 32.7167 29.1492 32.8L28.7492 36H23.2492ZM26.0492 29.5C27.0159 29.5 27.8409 29.1583 28.5242 28.475C29.2076 27.7917 29.5492 26.9667 29.5492 26C29.5492 25.0333 29.2076 24.2083 28.5242 23.525C27.8409 22.8417 27.0159 22.5 26.0492 22.5C25.0659 22.5 24.2367 22.8417 23.5617 23.525C22.8867 24.2083 22.5492 25.0333 22.5492 26C22.5492 26.9667 22.8867 27.7917 23.5617 28.475C24.2367 29.1583 25.0659 29.5 26.0492 29.5Z"
        fill="#F6F8FC"
      />
      <defs>
        <filter
          id="filter0_b_0_1"
          x="-10"
          y="-10"
          width="72"
          height="72"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="5" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_0_1"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_0_1"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_0_1"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(29.3932 51.058) rotate(91.1986) scale(54.0764 165.061)"
        >
          <stop stopColor="white" />
          <stop offset="0.267356" stopColor="white" stopOpacity="0.571178" />
          <stop offset="0.539839" stopColor="white" stopOpacity="0.260455" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_0_1"
          x1="42.5"
          y1="59"
          x2="12.5"
          y2="101"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#424242" />
          <stop offset="0.999067" stopOpacity="0.09" />
        </linearGradient>
      </defs>
    </svg>
  ) : (
    <Svg width="16" height="16" viewBox="0 0 48 48" {...props}>
      <G fill="none" data-name="invisible box">
        <Path d="M0 0h48v48H0z" data-name="Rectangle 323" />
        <Path d="M0 0h48v48H0z" data-name="Rectangle 324" />
        <Path d="M0 0h48v48H0z" data-name="Rectangle 325" />
      </G>
      <G data-name="icons Q2">
        <Path
          fill="#fff"
          d="m40.2 29.2 5.5-1.5a23 23 0 0 0 0-7.4l-5.5-1.5a1.8 1.8 0 0 1-1.1-2.6l2.8-5a20.6 20.6 0 0 0-5.1-5.1l-5 2.8-.8.2a1.8 1.8 0 0 1-1.8-1.3l-1.5-5.5a23 23 0 0 0-7.4 0l-1.5 5.5A1.8 1.8 0 0 1 17 9.1l-.8-.2-5-2.8a20.6 20.6 0 0 0-5.1 5.1l2.8 5a1.8 1.8 0 0 1-1.1 2.6l-5.5 1.5a23 23 0 0 0 0 7.4l5.5 1.5a1.8 1.8 0 0 1 1.1 2.6l-2.8 5a20.6 20.6 0 0 0 5.1 5.1l5-2.8.8-.2a1.8 1.8 0 0 1 1.8 1.3l1.5 5.5a23 23 0 0 0 7.4 0l1.5-5.5a1.8 1.8 0 0 1 1.8-1.3l.8.2 5 2.8a20.6 20.6 0 0 0 5.1-5.1l-2.8-5a1.8 1.8 0 0 1 1.1-2.6ZM24 33a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z"
          data-name="Path 210"
        />
      </G>
    </Svg>
  );
});
