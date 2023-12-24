import { App } from "obsidian";
import BaseDB from "./BaseDB";
import { TransactionType } from "@/types/TransactionType";
import type { CategoryType } from "@/types/CategoryType";
import { SpecialCategoryType } from "@/enums/SpecialCategoryTypeEnum";

export class DBCategories extends BaseDB {
  $id = "categories";

  constructor(app: App, dbLocation: string) {
    super(app, dbLocation + "/categories.json");
  }

  getCategories(
    type: TransactionType,
    walletId: number,
    showSubcategories = false
  ) {
    const entriesCollection = this.getCollection();
    if (!entriesCollection) {
      return [] as CategoryType[];
    }
    const cacheKey = this.cache.getKey(type, walletId, showSubcategories);
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData as CategoryType[];
    }

    const query: any = { wallet: walletId };
    if (type) {
      query.type = type;
    }
    if (!showSubcategories) {
      query.parent = undefined;
    }

    // Use LokiJS chain() method for efficient querying
    const filteredData = entriesCollection.chain().find(query);

    let resultData = filteredData.data() as CategoryType[];

    if (showSubcategories) {
      const parentMap = new Map<number, CategoryType[]>();
      for (const cat of resultData) {
        if (cat.parent) {
          if (!parentMap.has(cat.parent)) {
            parentMap.set(cat.parent, []);
          }

          parentMap.get(cat.parent)?.push(cat);
        } else if (cat.$loki) {
          if (!parentMap.has(cat.$loki)) {
            parentMap.set(cat.$loki, []);
          }

          //place in first position
          parentMap.get(cat.$loki)?.unshift(cat);
        }
      }

      resultData = Array.from(parentMap.entries())
        .sort((a, b) => a[0] - b[0]) // Sorting by map keys (which are numbers)
        .flatMap((entry) => entry[1]);
    }

    this.cache.set(cacheKey, resultData);

    return resultData as CategoryType[];
  }

  getChildCategories(walletID: number, parentId: number) {
    const categories = this.getCollection();
    const childCategories = categories.find({
      parent: parentId,
      wallet: walletID,
    });
    return childCategories;
  }

  getCategoryByName(walletID: number, name: string) {
    const categories = this.getCollection();
    const category = categories.findOne({
      wallet: walletID,
      name: { $regex: new RegExp(name, "i") },
    });
    return category;
  }

  isCategoryExpense(category: CategoryType) {
    if (!category) return true;

    if (category.type == TransactionType.DebtLoan) {
      return (
        category.specialCategoryType == SpecialCategoryType.LendMoney ||
        category.specialCategoryType == SpecialCategoryType.DebtRepayment
      );
    }
    return category.type === TransactionType.Expense;
  }
}
