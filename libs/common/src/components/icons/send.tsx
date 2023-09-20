import { observer } from "mobx-react-lite";
import Svg, { Path, SvgProps } from "react-native-svg";

export const SendIcon = observer(function SendIcon(
  props: SvgProps & { color?: string; themeMode?: string },
) {
  const getColor = () => {
    if (props.color) {
      return props.color;
    }

    return "#fff";
  };

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
          d="M25.2629 37.9914L21.0203 33.7488L25.2629 26.6777L18.1919 30.9204L13.9492 26.6777L33.0411 18.8996L25.2629 37.9914Z"
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
            transform="translate(9 25.9706) rotate(-45)"
          />
        </clipPath>
      </defs>
    </svg>
  ) : (
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
