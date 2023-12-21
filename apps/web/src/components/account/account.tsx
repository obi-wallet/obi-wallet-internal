import { Text } from "@/components/text/text";
import { observer } from "mobx-react-lite";
import { FaQrcode, FaCopy, FaLink } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaCircleUser } from "react-icons/fa6";

export const Account = observer(function Account() {
  return (
    <div className="flex  space-x-7">
      {/* <div className="h-28 w-28 rounded-full bg-sky-500"></div> */}
      <FaCircleUser className="h-28 w-28 text-white" />
      <div className="flex flex-col justify-around">
        <Text size="2xl" color="white">
          My Account
        </Text>
        <Text size="3xl" color="white" fontWeight="bold">
          6,178.04 USD
        </Text>
        <div className="flex space-x-4">
          <FaQrcode className="h-6 w-6 text-white" />
          <FaCopy className="h-6 w-6 text-white" />
          <FaArrowUpRightFromSquare className="h-6 w-6 text-white" />
          <FaLink className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
});
