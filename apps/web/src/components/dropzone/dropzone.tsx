import { ComponentPropsWithoutRef } from "react";
import { useDropzone } from "react-dropzone";

import "react-dropzone/examples/theme.css";

type DropzoneProps = { placeholder: string } & Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
>;

export function Dropzone(
  _props: DropzoneProps & { onChange: (file: FileList) => void },
) {
  const { placeholder } = _props;
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (files) => {
      _props.onChange(files as unknown as FileList);
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
