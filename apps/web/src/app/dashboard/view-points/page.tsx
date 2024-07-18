"use client";

import { Box, Button } from "@/components";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function ViewPoints() {
  return (
    <div className="w-full ">
      <Box className="w-full lg:w-1/2 bg-panel-gradient relative flex flex-col gap-4 rounded-tl-[10px] rounded-tr-[10px] font-press-start-2p">
        <div className="text-white flex flex-col justify-between gap-4 text-[12px] font-regular">
          <div className="flex justify-between items-center w-full">
            <h4 className="text-[18px] font-regular">Score: 000069</h4>
          </div>
          <div className="flex justify-between items-center w-full">
            <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">Create Account</p>
            <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>69</p>
          </div>
          <div className="flex justify-between items-center w-full opacity-50">
            <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">Use Tunnel</p>
            <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>1/$</p>
          </div>
          <div className="flex justify-between items-center w-full opacity-50">
            <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">Extra Life</p>
            <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>99</p>
          </div>
          <div className="flex justify-between items-center w-full opacity-50">
            <p className="drop-shadow-[2px_2px_2px_rgb(0,0,0)]">Do Something</p>
            <p className="flex items-center gap-1"><Image src="/Clip path group.png" height={14} width={16} alt="star"/>69</p>
          </div>
        </div>
        <Button
          className="p-0 text-[14px] bg-transparent border-0 hover:bg-transparent absolute top-2 right-4 "
          href="/dashboard/settings"
        >
          x
        </Button>
      </Box>
    </div>
  );
});
