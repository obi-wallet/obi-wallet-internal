import { Beneficiary, FlexAccount, SinglesigWallet } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { BeneficiaryItem } from "./beneficiary";
import { AbstractAccountItemProps } from "./common";
import { FlexAccountItem } from "./flex-account";
import { SinglesigWalletItem } from "./singlesig-wallet";

export interface AccountItemProps extends AbstractAccountItemProps {
  account: Beneficiary | FlexAccount | SinglesigWallet;
  onDelete: () => void;
  onChange: (account: Beneficiary | FlexAccount | SinglesigWallet) => void;
}

export const AccountItem = observer<AccountItemProps>(function AccountItem({
  account,
  ...props
}) {
  switch (account.type) {
    case "beneficiary":
      return <BeneficiaryItem account={account} {...props} />;
    case "flex-account":
      return <FlexAccountItem account={account} {...props} />;
    case "singlesig-wallet":
      return <SinglesigWalletItem account={account} {...props} />;
  }
});
