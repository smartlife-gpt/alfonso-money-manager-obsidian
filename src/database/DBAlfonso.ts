import { App } from "obsidian";
import { DBCategories } from "./DBCategories";
import { DBWallets } from "./DBWallets";
import { DBEvents } from "./DBEvents";
import { DBTransactions } from "./DBTransactions";
import DBQuery from "./DBQuery";
import ExchangeRateManager from "@/plugin/ExchangeRateService";
import type { TransactionRecordGroupType } from "@/types/TransactionRecordGroupType";
import type { TransactionRecordType } from "@/types/TransactionRecordType";
import type { ChartRecordGroupType } from "@/types/ChartRecordGroupType";
import type { PeriodType } from "@/types/PeriodType";
import {
  endOfWeek,
  format,
  getQuarter,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import ChartDataProcessor from "@/plugin/ChartDataProcessor";

export class DBAlfonso {
  app: App;
  dbLocation: string;

  dbQuery: DBQuery;

  wallets: DBWallets;
  categories: DBCategories;
  events: DBEvents;
  transactions: DBTransactions;

  exchangeRateManager: ExchangeRateManager;
  chartDataProcessor: ChartDataProcessor;

  constructor(app: App, dbLocation: string) {
    this.app = app;
    this.dbLocation = dbLocation;

    this.dbQuery = new DBQuery(this);

    this.wallets = new DBWallets(app, dbLocation);
    this.categories = new DBCategories(app, dbLocation);
    this.events = new DBEvents(app, dbLocation);
    this.transactions = new DBTransactions(app, dbLocation);

    this.exchangeRateManager = ExchangeRateManager.getInstance();
    this.chartDataProcessor = new ChartDataProcessor();
  }

  async loadDatabases() {
    await this.wallets.loadDatabase();
    await this.categories.loadDatabase();
    await this.events.loadDatabase();
    await this.transactions.loadDatabase();
  }

  close() {
    this.wallets.close();
    this.categories.close();
    this.events.close();
    this.transactions.close();
  }

  executeHumanQuery(humanQuery: string): ChartRecordGroupType | undefined {
    const parsedQuery = this.dbQuery.parseHumanQuery(humanQuery);
    if (!parsedQuery) return;

    if (!parsedQuery.groupBy) {
      parsedQuery.groupBy = "date";
      parsedQuery.groupByPeriod = "daily";
    }

    const query = this.dbQuery.generateQuery(parsedQuery);
    const result = this.transactions.execQuery(query);

    if (!result || result.length === 0) {
      return;
    }

    let groupByResult: TransactionRecordGroupType[] = [];

    if (parsedQuery.groupBy === "date") {
      groupByResult = this.groupByDate(result, parsedQuery.groupByPeriod);
    }

    return this.chartDataProcessor.processData(
      groupByResult,
      parsedQuery.chartType || "line",
      parsedQuery.groupByPeriod || "daily"
    );
  }

  formatDateKey(datetime: string, period: PeriodType): string {
    const dateObj = new Date(datetime);

    switch (period) {
      case "daily":
        return format(dateObj, "dd/MM/yyyy");
      case "weekly":
        return (
          format(startOfWeek(dateObj), "dd/MM/yyyy") +
          " - " +
          format(endOfWeek(dateObj), "dd/MM/yyyy")
        );
      case "monthly":
        return format(startOfMonth(dateObj), "MM/yyyy");
      case "quarterly":
        return "Q" + getQuarter(dateObj) + " " + format(dateObj, "yyyy");
      case "yearly":
        return format(startOfYear(dateObj), "yyyy");
      default:
        return format(dateObj, "dd/MM/yyyy");
    }
  }

  groupByDate(
    transactions: TransactionRecordType[],
    period: PeriodType = "daily"
  ) {
    const result: { [key: string]: TransactionRecordGroupType } = {};

    const wallet = this.wallets.getById(transactions[0].wallet);

    transactions.sort((a, b) => {
      if (!a.miliseconds || !b.miliseconds) return 0;
      return b.miliseconds - a.miliseconds;
    });

    for (const transaction of transactions) {
      const dayKey = this.formatDateKey(transaction.datetime, period);
      if (!result[dayKey]) {
        result[dayKey] = {
          type: "date",
          title: new Date(transaction.datetime),
          inflow: 0,
          outflow: 0,
          net: 0,
          transactions: [],
        };
      }

      const group = result[dayKey];

      let amount = transaction.amount.amount;
      if (wallet && transaction.amount.currency !== wallet.currency) {
        amount = this.exchangeRateManager.convert(
          amount,
          transaction.amount.currency,
          wallet.currency
        );
      }

      const category = this.categories.getById(transaction.category);
      if (!category) continue;

      const isExpense = this.categories.isCategoryExpense(category);
      if (!isExpense) {
        group.inflow += amount;
        group.net += amount;
      } else if (isExpense) {
        group.outflow += amount;
        group.net -= amount;
      }

      group.transactions.push({
        ...transaction,
        isExpense,
        category,
      });
    }

    return Object.values(result);
  }
}
