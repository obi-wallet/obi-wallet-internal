import { Beneficiary, FlexAccount, SinglesigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import { BeneficiaryItem } from "./beneficiary";
import { AbstractAccountItemProps } from "./common";
import { FlexAccountItem } from "./flex-account";
import { SinglesigWalletItem } from "./singlesig-wallet";

export interface AccountItemProps extends AbstractAccountItemProps {
  originalAccount: Beneficiary | FlexAccount | SinglesigWallet | null;
  account: Beneficiary | FlexAccount | SinglesigWallet;
  onDelete: () => void;
  onChange: (account: Beneficiary | FlexAccount | SinglesigWallet) => void;
}

export const AccountItem = observer<AccountItemProps>(function AccountItem({
  originalAccount,
  account,
  ...props
}) {
  switch (account.type) {
    case "beneficiary":
      return <BeneficiaryItem account={account} {...props} />;
    case "flex-account":
      return (
        <FlexAccountItem
          account={account}
          originalAccount={originalAccount as FlexAccount | null}
          {...props}
        />
      );
    case "singlesig-wallet":
      return <SinglesigWalletItem account={account} {...props} />;
  }
});
