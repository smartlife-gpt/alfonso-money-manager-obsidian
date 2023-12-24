import type { ContactType } from "./ContactType";
import type { CurrencyType } from "./CurrencyType";
import type { TransactionType } from "./TransactionType";

export interface TransactionRecordType {
  $loki: number;
  wallet: number;
  type: TransactionType;
  datetime: string;
  miliseconds?: number;
  amount: CurrencyType;
  category: number;
  contact?: ContactType;
  notes?: string;
  event?: number;

  linkedTransactions?: number[];

  //   recurrence?: RecurrenceType;
}
