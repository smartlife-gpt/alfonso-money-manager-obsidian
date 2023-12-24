import type { CurrencyType } from "./CurrencyType";
import type { PeriodType } from "./PeriodType";
import type { ChartType } from "./TransactionFilterType";

export type ChartRecordGroupType = {
  chartType: ChartType;
  period?: PeriodType;
  labels?: string[];
  series?:
    | {
        name: string;
        data: number[];
      }[]
    | number[];
  colors?: string[];

  result?: CurrencyType;
};
