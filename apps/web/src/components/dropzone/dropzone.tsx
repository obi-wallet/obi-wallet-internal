import { ComponentPropsWithoutRef } from "react";
import { useDropzone } from "react-dropzone";

import "react-dropzone/examples/theme.css";

type DropzoneProps = { placeholder: string } & ComponentPropsWithoutRef<"div">;

export function Dropzone({ placeholder }: DropzoneProps) {
  const { getRootProps, getInputProps } = useDropzone();

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
