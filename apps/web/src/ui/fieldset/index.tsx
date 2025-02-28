"use client";

import { Text } from "@/components";
import {
  Fieldset as FieldsetComponent,
  Legend as LegendComponent,
} from "@headlessui/react";
import { ReactNode } from "react";

export function Fieldset({
  children,
  legend,
  footer,
}: {
  children: ReactNode;
  legend: string;
  className?: string | undefined;
  legendClassname?: string;
  footer?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <FieldsetComponent>
      <LegendComponent as={Text} size="sm" className="mb-2 text-gray-200">
        {legend}
      </LegendComponent>

      <div className="w-full rounded-[5px] border border-[#32c9af]">
        {children}
      </div>

      {footer}
    </FieldsetComponent>
  );
}
