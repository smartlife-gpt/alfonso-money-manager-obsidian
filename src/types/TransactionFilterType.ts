import type { CategoryType } from "./CategoryType";
import type { ContactType } from "./ContactType";
import type { EventType } from "./EventType";
import type { PeriodType } from "./PeriodType";
import type { TransactionGroupType } from "./TransactionRecordGroupType";
import type { TransactionType } from "./TransactionType";

export type AmountFilter =
  | { type: "over"; value: number }
  | { type: "under"; value: number }
  | { type: "between"; min: number; max: number }
  | { type: "exact"; value: number };

export type DateFilter =
  | { type: "before"; date: string }
  | { type: "after"; date: string }
  | { type: "between"; start: string; end: string }
  | { type: "exact"; date: string }
  | { type: "all" };

type CategoryFilter = {
  includeChildren: boolean;
  categories: CategoryType[];
};

type ContactFilter = {
  contacts: ContactType[];
};

type EventFilter = {
  events: EventType[];
};

export type ChartType =
  | "pie"
  | "bar"
  | "line"
  | "SUM"
  | "AVG"
  | "COUNT"
  | "MIN"
  | "MAX";

export interface TransactionSearchFilter {
  database: string;
  wallet: number;

  amount?: AmountFilter;
  date?: DateFilter;
  category?: CategoryFilter;
  contact?: ContactFilter;
  note?: string;
  event?: EventFilter;
  type?: TransactionType;

  groupBy?: TransactionGroupType;
  groupByPeriod?: PeriodType;
  chartType?: ChartType;
}
