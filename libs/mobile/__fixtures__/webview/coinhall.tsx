import { CommonActions } from "@react-navigation/native";
import { useEffect } from "react";

import { Modals, RootRoute, StateRenderer, useRootNavigation } from "../../src";

export default () => {
  const navigation = useRootNavigation();

  useEffect(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: RootRoute.Home },
          {
            name: RootRoute.WebView,
            params: {
              app: {
                label: "Coinhall",
                url: "https://coinhall.org",
                icon: null,
              },
            },
          },
        ],
      })
    );
  }, [navigation]);

  return (
    <>
      <StateRenderer />
      <Modals />
    </>
  );
};
