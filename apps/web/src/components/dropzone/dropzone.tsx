"use client";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";

import "react-dropzone/examples/theme.css";

export interface DropzoneProps extends DropzoneOptions {
  placeholder: string;
  onChange(files: File[]): void;
}

export function Dropzone(props: DropzoneProps) {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>("");
  const { placeholder } = props;
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (files) => {
      setFile(files[0]);

      if (file?.type.startsWith("image"))
        setPreview(URL.createObjectURL(files[0] as File));

      props.onChange(files);
    },
    ...props,
  });

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => {
      if (preview !== "") URL.revokeObjectURL(preview);
    };
  }, []);

  console.log({ file });
  return (
    <div
      {...getRootProps({ className: "dropzone" })}
      className="flex w-full justify-center rounded border border-dashed border-gray-500 bg-transparent py-5 text-gray-300"
    >
      <input {...getInputProps()} />
      {file ? (
        file.type.startsWith("image") ? (
          <img src={URL.createObjectURL(file)} className="w-96 rounded-full" />
        ) : (
          <p>{file.name}</p>
        )
      ) : (
        <p>{placeholder}</p>
      )}
    </div>
  );
}
