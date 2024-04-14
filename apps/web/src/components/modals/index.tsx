import { ReactNode } from "react";
import { createPortal } from "react-dom";

export * from "./modal";
export * from "./travel-modal";

export function renderModal(children: ReactNode) {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return createPortal(children, modalRoot);
}
