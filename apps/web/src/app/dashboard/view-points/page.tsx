"use client";

import { Box, Button } from "@/components";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import usePointsData from "@/hooks/use-points-data";
export default observer(function ViewPoints() {

  const pointsData = usePointsData();
  const router = useRouter();
  return (
    <div className="w-full ">
      <Box className="w-full lg:w-1/2 bg-panel-gradient relative flex flex-col gap-4 rounded-tl-[10px] rounded-tr-[10px] font-press-start-2p min-h-[250px]">
        <div className="text-white flex flex-col justify-between gap-4 text-[12px] font-regular">
          { pointsData.loading ?  (
            <div className="flex justify-between items-center w-full">
              <h5 className="text-[18px] font-regular">Loading...</h5>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center w-full">
                <h4 className="text-[18px] font-regular">Score: { pointsData.totalPoints }</h4>
              </div>
              <div className={`flex justify-between items-center w-full ${pointsData.createWalletPoints === 0 && 'opacity-50'}`}>
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">{pointsData.eventsToPoints.createWallet.event_name}</p>
                <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>{ pointsData.createWalletPoints }</p>
              </div>
              <div className={`flex justify-between items-center w-full ${pointsData.addKeyPoints === 0 && 'opacity-50'}`}>
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">{pointsData.eventsToPoints.addKey.event_name}</p>
                <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>{ pointsData.addKeyPoints }</p>
              </div>
              <div className={`flex justify-between items-center w-full ${pointsData.appConnectPoints === 0 && 'opacity-50'}`}>
                <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">{pointsData.eventsToPoints.appConnect.event_name}</p>
                <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>{ pointsData.appConnectPoints }</p>
              </div>
            </>
          )}
        </div>
        <Button
          className="p-0 text-[14px] bg-transparent border-0 hover:bg-transparent absolute top-2 right-4 active:bg-transparent"
          onClick={() => router.back()}
        >
          x
        </Button>
      </Box>
    </div>
  );
});
