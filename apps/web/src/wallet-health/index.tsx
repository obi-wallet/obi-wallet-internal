import { Box, Button, Divider, Text } from "@/components";
import { cn } from "@/lib/utils";
import {
  useEd25519PublicKeyKnownCheck,
  useLocalDataIsUpToDateCheck,
  useOwnerUpToDateCheck,
  useSecp256k1PublicKeyKnownCheck,
  useWalletBackupCheck,
  useWalletBackupIncludesEasyShareCheck,
  useWalletHasEasyShareCheck,
  WalletHealthCheck,
} from "@/wallet-health/checks";
import { observer } from "mobx-react-lite";

export const HealthChecks = observer(function HealthChecks() {
  const secp256k1PublicKeyKnownCheck = useSecp256k1PublicKeyKnownCheck();
  const ed25519PublicKeyKnownCheck = useEd25519PublicKeyKnownCheck();
  const ownerUpToDateCheck = useOwnerUpToDateCheck();
  const walletBackupCheck = useWalletBackupCheck();
  const walletBackupIncludesEasyShare = useWalletBackupIncludesEasyShareCheck();
  const walletHasEasyShare = useWalletHasEasyShareCheck();
  const localDataIsUpToDate = useLocalDataIsUpToDateCheck();

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

        <HealthCheckRow check={secp256k1PublicKeyKnownCheck} />
        <HealthCheckRow check={ed25519PublicKeyKnownCheck} />
        <HealthCheckRow check={ownerUpToDateCheck} />
        <HealthCheckRow check={walletBackupCheck} />
        <HealthCheckRow check={walletBackupIncludesEasyShare} />
        <HealthCheckRow check={walletHasEasyShare} />
        <HealthCheckRow check={localDataIsUpToDate} />
      </Box>
    </div>
  );
});

function HealthCheckRow({ check }: { check: WalletHealthCheck }) {
  const success = check.query.isSuccess && !!check.query.data;
  const failure =
    (check.query.isSuccess && !check.query.data) || check.query.isError;
  const resolvable = failure && check.resolve;

  return (
    <Button
      className={cn("my-1 w-full justify-between", {
        "cursor-default": !resolvable,
        "bg-green-900 hover:bg-green-900": success,
        "bg-red-900 hover:bg-red-900": failure,
      })}
      variant="secondary"
      onClick={() => {
        if (resolvable) {
          check.resolve?.mutate();
        }
      }}
      disabled={check.resolve?.isPending}
    >
      <Text size="xl">{check.label}</Text>
      <Text size="sm">
        {success ? "Success" : failure ? "Failure" : "Checking…"}
        {resolvable ? (
          <Text size="sm" className="ml-1">
            (click to resolve)
          </Text>
        ) : null}
      </Text>
    </Button>
  );
}
