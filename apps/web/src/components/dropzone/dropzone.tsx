"use client";
import { ComponentPropsWithoutRef } from "react";
import { useDropzone } from "react-dropzone";
import "react-dropzone/examples/theme.css";

export interface DropzoneProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  placeholder: string;
  onChange(files: File[]): void;
}

export function Dropzone(props: DropzoneProps) {
  const { placeholder } = props;
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (files) => {
      props.onChange(files);
    },
  });

  return (
    <div
      {...getRootProps({ className: "dropzone" })}
      className="flex w-full cursor-pointer justify-center rounded border border-dashed border-gray-500 bg-transparent py-5 text-gray-300"
    >
      <input {...getInputProps()} />
      <p>{placeholder}</p>
    </div>
  );
}
