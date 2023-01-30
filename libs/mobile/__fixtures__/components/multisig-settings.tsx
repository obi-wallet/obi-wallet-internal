import { MultisigKey } from "@obi-wallet/common";

import { MultisigSettings } from "../../src/components/multisig-settings";

const multisigKey = new MultisigKey();

export default <MultisigSettings multisigKey={multisigKey} />;
