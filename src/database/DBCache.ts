export default class DBCache {
  cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  getKey(...args: any[]) {
    // Serialize each argument and join them into a string
    return args
      .map((arg) => {
        if (Array.isArray(arg)) {
          return arg.join(",");
        }
        return String(arg);
      })
      .join("-");
  }

  invalidate(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  set(cacheKey: string, data: any) {
    this.cache.set(cacheKey, data);
  }

  get(cacheKey: string) {
    return this.cache.get(cacheKey);
  }

  has(cacheKey: string) {
    return this.cache.has(cacheKey);
  }
}
