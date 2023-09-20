import { observer } from "mobx-react-lite";
import Svg, { Path, SvgProps } from "react-native-svg";

export const ReceiveIcon = observer(function ReceiveIcon(
  props: SvgProps & { color?: string; themeMode?: string },
) {
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
      <g clipPath="url(#clip0_0_1)">
        <path
          d="M25.2471 14.9785L29.2765 19.4242L24.6921 26.2786L31.9628 22.3879L35.9922 26.8336L16.5417 33.6658L25.2471 14.9785Z"
          fill="#F6F8FC"
        />
      </g>
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
        <clipPath id="clip0_0_1">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(40.9004 27.7827) rotate(137.812)"
          />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M19.704 21.047 9.181 24.558c-4.725 1.575-7.292-1.003-5.729-5.728L6.964 8.307c2.357-7.082 6.23-7.082 8.587 0l1.038 3.126 3.127 1.039c7.07 2.345 7.07 6.206-.012 8.575Z"
        fill="#fff"
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
