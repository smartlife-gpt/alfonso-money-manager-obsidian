import type { CategoryType } from "./CategoryType";
import type { TransactionRecordType } from "./TransactionRecordType";

export type TransactionGroupType =
  | "category"
  | "date"
  | "contact"
  | "event"
  | "transaction";

export type ExtendedTransactionRecordType = Omit<
  TransactionRecordType,
  "category"
> & {
  isExpense: boolean;
  category: CategoryType;
  percentage?: number;
};

export interface TransactionRecordGroupType {
  title: Date | CategoryType | string;
  type: TransactionGroupType;
  inflow: number;
  outflow: number;
  net: number;
  transactions: ExtendedTransactionRecordType[];
}
