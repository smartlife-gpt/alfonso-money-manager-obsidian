import type { PeriodType } from "@/types/PeriodType";
import type {
  ChartType,
  TransactionSearchFilter,
} from "@/types/TransactionFilterType";
import type { TransactionGroupType } from "@/types/TransactionRecordGroupType";
import { TransactionType } from "@/types/TransactionType";
import { format, getTime, parse } from "date-fns";
import type { DBAlfonso } from "./DBAlfonso";

export default class DBQuery {
  db: DBAlfonso;

  constructor(db: DBAlfonso) {
    this.db = db;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  }

  parseDateToFns(
    dateString: string,
    formatString: string = "dd/MM/yyyy HH:mm"
  ): number {
    const parsedDate = parse(dateString, formatString, new Date());
    return getTime(parsedDate);
  }

  generateQuery(filter: TransactionSearchFilter): any {
    const query: any = {
      wallet: filter.wallet,
    };

    // Amount Filtering
    if (filter.amount) {
      switch (filter.amount.type) {
        case "over":
          query["amount.amount"] = { $gt: filter.amount.value };
          break;
        case "under":
          query["amount.amount"] = { $lt: filter.amount.value };
          break;
        case "between":
          query["amount.amount"] = {
            $between: [filter.amount.min, filter.amount.max],
          };
          break;
        case "exact":
          query["amount.amount"] = filter.amount.value;
          break;
      }
    }

    // Date Filtering
    if (filter.date) {
      switch (filter.date.type) {
        case "before":
          query.miliseconds = { $lt: this.parseDateToFns(filter.date.date) };
          break;
        case "after":
          query.miliseconds = { $gt: this.parseDateToFns(filter.date.date) };
          break;
        case "between":
          query.miliseconds = {
            $between: [
              this.parseDateToFns(filter.date.start),
              this.parseDateToFns(filter.date.end),
            ],
          };
          break;
        case "exact":
          query.miliseconds = this.parseDateToFns(filter.date.date);
          break;
      }
    }

    // Category Filtering
    if (filter.category && filter.category.categories.length > 0) {
      const categories = [
        ...filter.category.categories.map((category) => category.$loki),
      ] as number[];

      const childCategories = [] as number[];
      if (filter.category.includeChildren) {
        for (const $loki of categories) {
          const children = this.db.categories.getChildCategories(
            filter.wallet,
            $loki
          );
          childCategories.push(...children.map((child) => child.$loki));
        }
      }

      query.category = {
        $in: [...new Set([...categories, ...childCategories])],
      };
    }

    // Contact Filtering
    if (filter.contact && filter.contact.contacts.length > 0) {
      query.contact = { $in: filter.contact.contacts };
    }

    // Event Filtering
    if (filter.event && filter.event.events.length > 0) {
      query.event = { $in: filter.event.events.map((event) => event.$loki) };
    }

    if (filter.type && filter.type !== TransactionType.All) {
      query.type = filter.type;
    }

    return query;
  }

  generateHumanQuery(filter: TransactionSearchFilter): string {
    let queryText = `database: ${filter.database}`;

    queryText += `\nwallet: ${this.db.wallets.getNameById(filter.wallet)}`;

    // Amount Filtering
    if (filter.amount) {
      switch (filter.amount.type) {
        case "over":
          queryText += `\nand amount greater than: ${filter.amount.value}`;
          break;
        case "under":
          queryText += `\nand amount less than: ${filter.amount.value}`;
          break;
        case "between":
          queryText += `\nand amount between: ${filter.amount.min} and ${filter.amount.max}`;
          break;
        case "exact":
          queryText += `\nand amount exact: ${filter.amount.value}`;
          break;
      }
    }

    // Date Filtering
    if (filter.date) {
      switch (filter.date.type) {
        case "before":
          queryText += `\nand date before: ${this.formatDate(
            filter.date.date
          )}`;
          break;
        case "after":
          queryText += `\nand date after: ${this.formatDate(filter.date.date)}`;
          break;
        case "between":
          queryText += `\nand date between: ${this.formatDate(
            filter.date.start
          )} and ${this.formatDate(filter.date.end)}`;
          break;
        case "exact":
          queryText += `\nand date exact: ${this.formatDate(filter.date.date)}`;
          break;
      }
    }

    // Category Filtering
    if (filter.category && filter.category.categories.length > 0) {
      const categoryNames = filter.category.categories.map(
        (category) => category.name
      );
      queryText += `\nand category in: ${categoryNames.join(", ")}`;

      if (filter.category.includeChildren) {
        queryText += `\nand include categories children`;
      }
    }

    // Event Filtering
    if (filter.event && filter.event.events.length > 0) {
      const eventNames = filter.event.events.map((event) => event.name);
      queryText += `\nand event in: ${eventNames.join(", ")}`;
    }

    if (filter.type) {
      queryText += `\nand type: ${filter.type}`;
    }

    //GroupBy
    if (filter.groupBy) {
      queryText += `\ngroup by: ${filter.groupBy}`;
      if (filter.groupByPeriod) {
        queryText += ` ${filter.groupByPeriod}`;
      }
    }

    //GroupByPeriod
    if (filter.groupByPeriod) {
      queryText += `\ngroup by period: ${filter.groupByPeriod}`;
    }

    //Chart Type
    if (filter.chartType) {
      queryText += `\nchart type: ${filter.chartType}`;
    }

    return queryText;
  }

  parseHumanQuery(queryText: string): TransactionSearchFilter {
    const lines = queryText.split("\n");
    const filter: Partial<TransactionSearchFilter> = {};

    lines.forEach((line) => {
      if (line.startsWith("database:")) {
        filter.database = line.replace("database:", "").trim();
      } else if (line.startsWith("wallet:")) {
        filter.wallet = this.db.wallets.getIdByName(
          line.replace("wallet:", "").trim()
        );
      } else if (line.includes("amount greater than:")) {
        filter.amount = {
          type: "over",
          value: parseFloat(line.split(":")[1].trim()),
        };
      } else if (line.includes("amount less than:")) {
        filter.amount = {
          type: "under",
          value: parseFloat(line.split(":")[1].trim()),
        };
      } else if (line.includes("amount between:")) {
        const amounts = line.split(":")[1].trim().split("and");
        filter.amount = {
          type: "between",
          min: parseFloat(amounts[0].trim()),
          max: parseFloat(amounts[1].trim()),
        };
      } else if (line.includes("amount exact:")) {
        filter.amount = {
          type: "exact",
          value: parseFloat(line.split(":")[1].trim()),
        };
      } else if (line.includes("date before:")) {
        filter.date = {
          type: "before",
          date: line.split("date before:")[1].trim(),
        };
      } else if (line.includes("date after:")) {
        filter.date = {
          type: "after",
          date: line.split("date after:")[1].trim(),
        };
      } else if (line.includes("date between:")) {
        const dates = line.split("date between:")[1].trim().split(" and ");
        filter.date = {
          type: "between",
          start: dates[0].trim(),
          end: dates[1].trim(),
        };
      } else if (line.includes("date exact:")) {
        filter.date = { type: "exact", date: line.split(":")[1].trim() };
      } else if (line.includes("category in:")) {
        const categoryNames = line.split(":")[1].trim().split(",");
        filter.category = {
          categories: categoryNames.map((name) =>
            this.db.categories.getCategoryByName(filter.wallet!, name.trim())
          ),
          includeChildren: false,
        };
      } else if (line.includes("include categories children")) {
        if (filter.category) {
          filter.category.includeChildren = true;
        }
      } else if (line.includes("event in:")) {
        const eventNames = line.split(":")[1].trim().split(",");
        filter.event = {
          events: eventNames.map((name) =>
            this.db.events.getEventByName(filter.wallet!, name.trim())
          ),
        };
      } else if (line.includes("note:")) {
        filter.note = line.split(":")[1].trim();
      } else if (line.includes("group by:")) {
        //if the groupBy is date there can be attached period to it like group by: date monthly
        // i want to keep the groupBy as date and the period as groupByPeriod
        const groupBy = line.split(":")[1].trim().split(" ");
        filter.groupBy = groupBy[0] as TransactionGroupType;
        if (groupBy[1]) {
          filter.groupByPeriod = groupBy[1] as PeriodType;
        }
      } else if (line.includes("chart type:")) {
        filter.chartType = line.split(":")[1].trim() as ChartType;
      } else if (line.includes("type:")) {
        filter.type = line.split(":")[1].trim() as TransactionType;
      }
    });

    return filter as TransactionSearchFilter;
  }

  static getDatabaseLocationFromQuery(queryText: string): string | undefined {
    const lines = queryText.split("\n");

    for (const line of lines) {
      if (line.startsWith("database:")) {
        return line.replace("database:", "").trim();
      }
    }

    return;
  }
}
