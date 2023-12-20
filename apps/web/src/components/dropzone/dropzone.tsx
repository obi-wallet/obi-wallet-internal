import { useDropzone } from "react-dropzone";

import "react-dropzone/examples/theme.css";
type DropzoneProps = React.ComponentPropsWithoutRef<"div">;

export const Dropzone = ({ className }: DropzoneProps) => {
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
      <p>Upload an Image</p>
    </div>
  );
};
