"use client";
import { useObjectUrl } from "@reactuses/core";
import Image from "next/image";
import { ComponentPropsWithoutRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import "react-dropzone/examples/theme.css";
import invariant from "tiny-invariant";

export interface ImageDropzoneProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  placeholder: string;
  onChange?: (file: File, fileBody: string) => void;
}

export function ImageDropzone({ placeholder, onChange }: ImageDropzoneProps) {
  const [file, setFile] = useState<File>();
  const fileObjectUrl = useObjectUrl(file);
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (files: File[]) => {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          invariant(
            typeof reader.result === "string",
            "Expected reader result to be base64 string",
          );

          onChange && onChange(file, reader.result);
          setFile(file);
        });

        reader.readAsDataURL(file);
      }
    },
    accept: {
      "image/png": [],
      "image/jpeg": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps({ className: "dropzone" })}
      className="flex w-full cursor-pointer justify-center rounded border border-dashed border-gray-500 bg-transparent py-5 text-gray-300"
    >
      <input {...getInputProps()} />
      {fileObjectUrl ? (
        <Image src={fileObjectUrl} className="w-96 rounded-full" alt="image" />
      ) : (
        <p>{placeholder}</p>
      )}
    </div>
  );
}
