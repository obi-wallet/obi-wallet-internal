import { Box, Button, Divider, Text } from "@/components";
import { cn } from "@/lib/utils";
import {
  usePublicKeyKnownCheck,
  WalletHealthCheck,
} from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";

export const HealthChecks = observer(function HealthChecks() {
  const publicKeyKnownCheck = usePublicKeyKnownCheck();

  return (
    <div className="grid h-full w-full text-white">
      <Box className="rounded-md text-xl">
        <Text size="xl">Wallet Health</Text>
        <Text className="mt-2">
          <span className="justify-center align-middle leading-normal">
            These checks help ensure that your wallet has no issues that could
            cause problems.
          </span>
        </Text>

        <Divider className="mb-7 mt-5" />

        <HealthCheckRow check={publicKeyKnownCheck} />
      </Box>
    </div>
  );
});

function HealthCheckRow({ check }: { check: WalletHealthCheck }) {
  return (
    <Button
      className={cn("my-1 w-full cursor-default justify-between", {
        "bg-green-900 hover:bg-green-900": check.query.isSuccess,
        "bg-red-900 hover:bg-red-900": check.query.isError,
      })}
      variant="secondary"
    >
      <Text size="xl">{check.label}</Text>
      <Text size="sm">
        {check.query.isSuccess
          ? "Success"
          : check.query.isError
            ? "Failure"
            : "Checking…"}
      </Text>
    </Button>
  );
}
