import { CurrencyEnum } from "@/enums/CurrencyEnum";

export interface WalletType {
  $loki: number;
  name: string;
  isDefault?: boolean;
  currency: CurrencyEnum;

  balance: number;
}
