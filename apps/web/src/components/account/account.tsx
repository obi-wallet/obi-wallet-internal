import { Text } from "@/components/text/text";
import { FaCircleUser } from "react-icons/fa6";

export function Account() {
  return (
    <div className="flex  space-x-7">
      {/* <div className="h-28 w-28 rounded-full bg-sky-500"></div> */}
      <FaCircleUser className="h-28 w-28 text-white" />
      <div className="flex flex-col justify-around">
        <Text size="2xl" color="white">
          My Account
        </Text>
        <Text size="3xl" color="white" fontWeight="bold">
          $6,178.04
        </Text>
      </div>
    </div>
  );
}
