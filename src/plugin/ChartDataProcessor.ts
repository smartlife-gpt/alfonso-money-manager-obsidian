import type { ChartRecordGroupType } from "@/types/ChartRecordGroupType";
import type { PeriodType } from "@/types/PeriodType";
import type { ChartType } from "@/types/TransactionFilterType";
import type { TransactionRecordGroupType } from "@/types/TransactionRecordGroupType";
import { format, parseISO } from "date-fns";

const MAX_DATA_POINTS = 100;
export default class ChartDataProcessor {
  getDateFormatByPeriod(period: PeriodType) {
    switch (period) {
      case "daily":
        return "dd/MM/yyyy";
      case "weekly":
        return "ww MM/yyyy";
      case "monthly":
        return "MMM yyyy";
      case "quarterly":
        return "QQQ yyyy";
      case "yearly":
        return "yyyy";
      default:
        return "dd/MM/yyyy";
    }
  }

  processData(
    queryResult: TransactionRecordGroupType[],
    chartType: ChartType,
    period: PeriodType
  ): ChartRecordGroupType {
    if (chartType === "line" || chartType === "bar") {
      return this.processLineBarData(queryResult, chartType, period);
    } else if (chartType === "pie") {
      return this.processPieData(queryResult, chartType, period);
    } else if (chartType.toLowerCase() === "sum") {
      return this.processSumData(queryResult);
    } else if (chartType.toLowerCase() === "avg") {
      return this.processAvgData(queryResult);
    } else if (chartType.toLowerCase() === "count") {
      return this.processCountData(queryResult);
    } else if (chartType.toLowerCase() === "min") {
      return this.processMinData(queryResult);
    } else if (chartType.toLowerCase() === "max") {
      return this.processMaxData(queryResult);
    } else {
      return this.processLineBarData(queryResult, chartType, period);
    }
  }

  private processCountData(
    queryResult: TransactionRecordGroupType[]
  ): ChartRecordGroupType {
    const currency = queryResult[0].transactions[0].amount.currency;
    return {
      chartType: "COUNT",
      result: {
        amount: queryResult.length,
        currency,
      },
    };
  }

  private processAvgData(
    queryResult: TransactionRecordGroupType[]
  ): ChartRecordGroupType {
    let sum = 0;

    const currency = queryResult[0].transactions[0].amount.currency;

    for (const key in queryResult) {
      const group = queryResult[key];
      sum += group.net;
    }

    return {
      chartType: "AVG",
      result: {
        amount: sum / queryResult.length,
        currency,
      },
    };
  }

  private processMinData(
    queryResult: TransactionRecordGroupType[]
  ): ChartRecordGroupType {
    let min = 0;

    const currency = queryResult[0].transactions[0].amount.currency;

    for (const key in queryResult) {
      const group = queryResult[key];
      if (group.net < min) {
        min = group.net;
      }
    }

    return {
      chartType: "MIN",
      result: {
        amount: min,
        currency,
      },
    };
  }

  private processMaxData(
    queryResult: TransactionRecordGroupType[]
  ): ChartRecordGroupType {
    let max = 0;

    const currency = queryResult[0].transactions[0].amount.currency;
    for (const key in queryResult) {
      const group = queryResult[key];
      if (group.net > max) {
        max = group.net;
      }
    }

    return {
      chartType: "MAX",
      result: {
        amount: max,
        currency,
      },
    };
  }

  private processSumData(
    queryResult: TransactionRecordGroupType[]
  ): ChartRecordGroupType {
    let sum = 0;

    const currency = queryResult[0].transactions[0].amount.currency;
    for (const key in queryResult) {
      const group = queryResult[key];
      sum += group.net;
    }

    return {
      chartType: "SUM",
      result: {
        amount: sum,
        currency,
      },
    };
  }

  private processLineBarData(
    queryResult: TransactionRecordGroupType[],
    chartType: ChartType,
    period: PeriodType
  ): ChartRecordGroupType {
    if (queryResult.length > MAX_DATA_POINTS) {
      queryResult = queryResult.slice(0, MAX_DATA_POINTS);
    }

    const resultsIncome = [];
    const resultExpense = [];
    const labels = [];
    const colors = [];
    const series = [];

    for (const key in queryResult) {
      const group = queryResult[key];

      const label = format(
        parseISO(group.transactions[0].datetime),
        this.getDateFormatByPeriod(period)
      );
      labels.unshift(label);
      resultsIncome.unshift(group.inflow);
      resultExpense.unshift(group.outflow);
      if (group.net >= 0) {
        colors.unshift("#00E396");
      } else {
        colors.unshift("#ff4560");
      }
    }
    series.push({
      name: "Income",
      data: resultsIncome,
    });
    series.push({
      name: "Expense",
      data: resultExpense,
    });

    return {
      chartType,
      period,
      labels,
      series,
      colors,
    };
  }

  private processPieData(
    queryResult: TransactionRecordGroupType[],
    chartType: ChartType,
    period: PeriodType
  ): ChartRecordGroupType {
    if (queryResult.length > MAX_DATA_POINTS) {
      queryResult = queryResult.slice(0, MAX_DATA_POINTS);
    }

    const results = [];
    const labels = [];
    const colors = [];
    const series = [];

    for (const key in queryResult) {
      const group = queryResult[key];

      const label = format(
        parseISO(group.transactions[0].datetime),
        this.getDateFormatByPeriod(period)
      );
      labels.unshift(label);
      results.unshift(Math.abs(group.net));
      if (group.net >= 0) {
        colors.unshift("#00E396");
      } else {
        colors.unshift("#ff4560");
      }
    }
    series.push(...results);

    return {
      chartType,
      period,
      labels,
      series,
      colors,
    };
  }
}
