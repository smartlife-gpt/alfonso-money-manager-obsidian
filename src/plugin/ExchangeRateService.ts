import { isToday } from "date-fns";
import { round } from "mathjs";

export default class ExchangeRateManager {
  private static instance: ExchangeRateManager;
  private rates: Record<string, number> = {};

  private constructor() {}

  public static getInstance(): ExchangeRateManager {
    if (!ExchangeRateManager.instance) {
      ExchangeRateManager.instance = new ExchangeRateManager();
    }
    return ExchangeRateManager.instance;
  }

  private async fetchRates() {
    try {
      const response = await fetch("https://www.floatrates.com/daily/eur.json");
      const data = await response.json();

      const currencyMap: Record<string, number> = { EUR: 1 }; // Initialize with EUR as the base currency

      for (const [key, value] of Object.entries(data)) {
        currencyMap[key.toUpperCase()] = (value as { rate: number }).rate;
      }

      this.rates = currencyMap;

      localStorage.setItem("ratesLastFetched", new Date().toISOString());
      localStorage.setItem("rates", JSON.stringify(this.rates));
    } catch (error) {
      console.error("Error fetching currency rates:", error);
      // Handle error or set default rates
    }
  }

  public async ensureLatestRates() {
    const lastFetched = localStorage.getItem("ratesLastFetched");
    const storedRates = localStorage.getItem("rates");

    if (storedRates) {
      this.rates = JSON.parse(storedRates);
    }

    if (!lastFetched || !isToday(new Date(lastFetched)) || !this.rates) {
      await this.fetchRates();
    }
  }

  public convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    const amountInEur = amount / this.rates[fromCurrency.toUpperCase()];
    return round(amountInEur * this.rates[toCurrency.toUpperCase()], 2);
  }
}
