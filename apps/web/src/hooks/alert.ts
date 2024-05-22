import { useStore } from "@/contexts";

export const useAlert = () => {
  const { alertStore } = useStore();
  return alertStore;
};
