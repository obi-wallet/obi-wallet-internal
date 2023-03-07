import { terra } from "@obi-wallet/common";
import { createContext } from "react";

export const PermissionedAddressesContext = createContext<
  Awaited<ReturnType<typeof terra.fetchPermissionedAddresses>> | undefined
>(undefined);
