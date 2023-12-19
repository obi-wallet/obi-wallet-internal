import { FileWithPath, useDropzone } from "react-dropzone";

import "react-dropzone/examples/theme.css";

import { cn } from "@/lib/utils";
export default function Dropzone({
  className,
}: React.ComponentPropsWithoutRef<"section">) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const files = acceptedFiles.map((file: FileWithPath) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

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
