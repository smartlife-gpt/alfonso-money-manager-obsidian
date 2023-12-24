import type { SpecialCategoryType } from "@/enums/SpecialCategoryTypeEnum";
import type { TransactionType } from "./TransactionType";

export interface CategoryType {
  $loki: number;
  wallet: number;
  name: string;
  parent?: number;
  type: TransactionType;

  specialCategoryType?: SpecialCategoryType;
}
