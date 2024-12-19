"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

export * from "./modal";

export function ModalPortal({ children }: { children: ReactNode }) {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(children, modalRoot);
}

export function renderModal(children: ReactNode) {
  return <ModalPortal>{children}</ModalPortal>;
}
