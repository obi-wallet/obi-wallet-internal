import { PermissionedAddress } from "@obi-wallet/sdk";
import { createContext } from "react";

export const PermissionedAddressesContext = createContext<
  PermissionedAddress[] | undefined
>(undefined);
