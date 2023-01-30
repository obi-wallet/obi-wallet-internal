import { CommonActions } from "@react-navigation/native";
import { useEffect } from "react";
import { useSelect } from "react-cosmos/fixture";

import {
  HomeBottomTabRoute,
  HomeDrawerRoute,
  Modals,
  OnboardingRoute,
  RootRoute,
  SettingsRoute,
  StateRenderer,
  useRootNavigation,
} from "../src";

type Route = RootRoute | OnboardingRoute | SettingsRoute | HomeBottomTabRoute;

const routes = [
  ...Object.values(RootRoute),
  ...Object.values(OnboardingRoute),
  ...Object.values(SettingsRoute),
  ...Object.values(HomeBottomTabRoute),
];

export default function Screens() {
  const navigation = useRootNavigation();
  const [route] = useSelect("route", {
    options: routes,
  });

  useEffect(() => {
    const routeAction = getRouteAction(route);
    if (routeAction) navigation.dispatch(routeAction);
  }, [navigation, route]);

  return (
    <>
      <StateRenderer />
      <Modals />
    </>
  );
}

function getRouteParams(route: Route) {
  switch (route) {
    case RootRoute.WebView:
      return {
        app: {
          label: "Google",
          url: "https://google.com",
          icon: null,
        },
      };
    case OnboardingRoute.CreateMultisigPhoneNumberConfirm:
      return {
        phoneNumber: "+123456789",
        securityQuestion: "birthplace",
        securityAnswer: "Wonderland",
      };
    case HomeBottomTabRoute.Settings:
      return {
        screen: RootRoute.Home,
      };
    default:
      return undefined;
  }
}

function getRouteAction(
  route: RootRoute | OnboardingRoute | SettingsRoute | HomeBottomTabRoute
) {
  const params = getRouteParams(route);

  if (isHomeBottomTabRoute(route)) {
    return homeRouteReset();
  } else if (isOnboardingRoute(route)) {
    return onboardingRouteReset();
  } else {
    return reset();
  }

  function reset(params: object | undefined = undefined) {
    return CommonActions.reset({
      index: 0,
      routes: [{ name: RootRoute.Home }, { name: route, params }],
    });
  }

  function onboardingRouteReset(params: object | undefined = undefined) {
    return CommonActions.reset({
      index: 0,
      routes: [{ name: route, params }],
    });
  }

  function homeRouteReset() {
    return CommonActions.reset({
      index: 0,
      routes: [
        {
          name: HomeDrawerRoute.HomeDrawer,
          state: {
            routes: [
              {
                name: route,
                params,
              },
            ],
          },
        },
      ],
    });
  }
}

function isHomeBottomTabRoute(route: Route): route is HomeBottomTabRoute {
  return Object.values(HomeBottomTabRoute).includes(
    route as unknown as HomeBottomTabRoute
  );
}

function isOnboardingRoute(route: Route): route is OnboardingRoute {
  return Object.values(OnboardingRoute).includes(
    route as unknown as OnboardingRoute
  );
}
