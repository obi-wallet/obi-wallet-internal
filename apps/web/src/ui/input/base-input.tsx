import { cn } from "@/lib/utils";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

export interface BaseInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}
interface ParentRef {
  focus: () => void;
}

export const BaseInput = forwardRef<ParentRef, BaseInputProps>(
  function BaseInput(
    { className, ...rest }: BaseInputProps,
    parentRef: React.Ref<ParentRef>,
  ) {
    const ref = useRef<HTMLInputElement>(null);
    useImperativeHandle(parentRef, () => ({
      // This function exposes the localRef's current value to the parent
      // You can also expose other methods or values if needed
      focus: () => {
        ref.current?.focus();
      },
    }));
    return (
      <input
        ref={ref}
        className={cn(
          // we need to remove focus and hover styles
          "p-0 text-lg text-white hover:border-transparent focus:border-transparent focus:outline-none focus:ring-0",
          "bg-transparent",
          className,
        )}
        {...rest}
      />
    );
  },
);
