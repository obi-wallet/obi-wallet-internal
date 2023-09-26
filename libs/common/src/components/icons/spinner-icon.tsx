import { observer } from "mobx-react-lite";
import { SvgProps } from "react-native-svg";

export const SpinnerIcon = observer<SvgProps>(function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="77"
      height="77"
      viewBox="0 0 77 77"
      fill="none"
    >
      <path
        d="M76 38.5C76 43.4246 75.03 48.3009 73.1455 52.8506C71.2609 57.4003 68.4987 61.5343 65.0165 65.0165C61.5343 68.4987 57.4003 71.2609 52.8506 73.1455C48.3009 75.03 43.4246 76 38.5 76C33.5754 76 28.6991 75.03 24.1494 73.1455C19.5997 71.2609 15.4657 68.4987 11.9835 65.0165C8.5013 61.5343 5.73907 57.4003 3.85452 52.8506C1.96997 48.3009 1 43.4246 1 38.5C1 33.5754 1.96997 28.6991 3.85452 24.1494C5.73907 19.5997 8.5013 15.4657 11.9835 11.9835C15.4657 8.5013 19.5997 5.73907 24.1494 3.85452C28.6991 1.96996 33.5754 0.999999 38.5 1C43.4246 1 48.3009 1.96997 52.8506 3.85452C57.4003 5.73907 61.5343 8.5013 65.0165 11.9835C68.4987 15.4657 71.2609 19.5997 73.1455 24.1494C75.03 28.6991 76 33.5754 76 38.5L76 38.5Z"
        stroke="url(#paint0_linear_1_899)"
        strokeLinecap="round"
      />
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="rotate"
        from="360 "
        to="0 "
        dur="0.5s"
        // additive="sum"
        repeatCount="indefinite"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_899"
          x1="38.5"
          y1="1"
          x2="38.5"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#2D2D2D" />
        </linearGradient>
      </defs>
    </svg>
  );
});
