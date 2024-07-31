"use client";

import { Box, Button } from "@/components";
import { usePointsData } from "@/hooks/use-points-data";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default observer(function ViewPoints() {
  const pointsData = usePointsData();
  const router = useRouter();
  return (
    <div className="w-full ">
      <Box className="bg-panel-gradient font-press-start-2p relative flex min-h-[250px] w-full flex-col gap-4 rounded-tl-[10px] rounded-tr-[10px] lg:w-1/2">
        <div className="font-regular flex flex-col justify-between gap-4 text-[12px] text-white">
          {pointsData.loading ? (
            <div className="flex w-full items-center justify-between">
              <h5 className="font-regular text-[18px]">Loading...</h5>
            </div>
          ) : (
            <>
              <div className="flex w-full items-center justify-between">
                <h4 className="font-regular text-[18px]">
                  Score: {pointsData.totalPoints}
                </h4>
              </div>
              <div
                className={`flex w-full items-center justify-between ${pointsData.createWalletPoints === 0 && "opacity-50"}`}
              >
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">
                  {pointsData.eventsToPoints.createWallet.event_name}
                </p>
                <p className="flex items-center gap-1">
                  <Image
                    src="/Clip path group.png"
                    height={14}
                    width={16}
                    alt="star"
                  />
                  {pointsData.createWalletPoints}
                </p>
              </div>
              <div
                className={`flex w-full items-center justify-between ${pointsData.addKeyPoints === 0 && "opacity-50"}`}
              >
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">
                  {pointsData.eventsToPoints.addKey.event_name}
                </p>
                <p className="flex items-center gap-1">
                  <Image
                    src="/Clip path group.png"
                    height={14}
                    width={16}
                    alt="star"
                  />
                  {pointsData.addKeyPoints}
                </p>
              </div>
              <div
                className={`flex w-full items-center justify-between ${pointsData.appConnectPoints === 0 && "opacity-50"}`}
              >
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">
                  {pointsData.eventsToPoints.appConnect.event_name}
                </p>
                <p className="flex items-center gap-1">
                  <Image
                    src="/Clip path group.png"
                    height={14}
                    width={16}
                    alt="star"
                  />
                  {pointsData.appConnectPoints}
                </p>
              </div>
            </>
          )}
        </div>
        <Button
          className="absolute right-4 top-2 border-0 bg-transparent p-0 text-[14px] hover:bg-transparent active:bg-transparent"
          onClick={() => {
            return router.back();
          }}
        >
          x
        </Button>
      </Box>
    </div>
  );
});
