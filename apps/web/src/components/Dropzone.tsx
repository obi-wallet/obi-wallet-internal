import { useDropzone } from "react-dropzone";

import "react-dropzone/examples/theme.css";

export default function Dropzone() {
  const { getRootProps, getInputProps } = useDropzone();

  return (
    <div
      {...getRootProps({ className: "dropzone" })}
      style={{
        borderRadius: "4px",
        backgroundColor: "transparent",
        width: "100%",
        borderColor: "#2A2B32",
      }}
    >
      <input {...getInputProps()} />
      <p>Upload an Image</p>
    </div>
  );
}
