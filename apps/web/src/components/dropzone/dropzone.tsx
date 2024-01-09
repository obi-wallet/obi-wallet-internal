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
      style={{
        borderRadius: "4px",
        backgroundColor: "transparent",
        width: "100%",
        borderColor: "#2A2B32",
        flex: 0,
      }}
    >
      <input {...getInputProps()} />
      <p>{placeholder}</p>
    </div>
  );
}
