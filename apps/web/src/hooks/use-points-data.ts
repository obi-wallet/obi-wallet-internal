import { useCurrentWallet } from "./use-current-wallet";
import { useState, useEffect } from "react";

interface EventType {
  id: number,
  walletId: number,
  eventType: number,
  payload: object,
}

interface PointType {
  id: number,
  userEntryAddress: string,
  events: EventType[],
}

const eventsToPoints = {
  createWallet: {
    event_name: "Create Wallet",
    event_point: 69,
  },
  addKey: {
    event_name: "Add Key",
    event_point: 42,
  },
  appConnect: {
    event_name: "Use DApp",
    event_point: 420,
  },
}

const calculatePointsFromEvents = (events: EventType[], eventType: number): number => {
  switch (eventType) {
    case 1:
      return events.filter((event) => event.eventType === 1).length * eventsToPoints.createWallet.event_point;
    case 2: 
      if (events.filter((event) => event.eventType === 2).length > 0) {
        return eventsToPoints.addKey.event_point;
      } else {
        return 0;
      }
    case 4:
      return events.filter((event) => event.eventType === 4).length * eventsToPoints.appConnect.event_point;
    default:
      return 0;
  }
}

export default function usePointsData() {
  const wallet = useCurrentWallet({});
  const [createWalletPoints, setCreateWalletPoints] = useState<number>(0); 
  const [addKeyPoints, setAddKeyPoints] = useState<number>(0); 
  const [appConnectPoints, setAppConnectPoints] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0); 
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://points.obiwallet.workers.dev/');
      if (!response.ok) {
        throw new Error('Points Response Failed');
      }
      const result: PointType[] = await response.json();
      if (!wallet) {
        return {
          createWalletPoints: 0,
          addKeyPoints: 0,
          appConnectPoints: 0,
          loading: 0,
          totalPoints: 0,
        };
      }
      if (wallet.userEntryAddress) {
        const pointsList = result.filter((item) => item.userEntryAddress === wallet.userEntryAddress)
        if (pointsList.length > 0 && pointsList[0]) {
          const data = pointsList[0].events
          setCreateWalletPoints(calculatePointsFromEvents(data, 1));
          setAddKeyPoints(calculatePointsFromEvents(data, 2));
          setAppConnectPoints(calculatePointsFromEvents(data, 4));
          setTotalPoints(calculatePointsFromEvents(data, 1) + calculatePointsFromEvents(data, 2) + calculatePointsFromEvents(data, 4));
        }
      }
  } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (wallet && wallet.userEntryAddress) {
      fetchData();
    }
  }, [wallet?.userEntryAddress, totalPoints]);

  return { createWalletPoints, addKeyPoints, appConnectPoints, loading, totalPoints, eventsToPoints };
}


