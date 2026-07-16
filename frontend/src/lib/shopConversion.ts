export type ShopLocale = "zh" | "en"

export interface ShopActionCopy {
  addToBag: string
  addedToBag: string
  viewDetails: string
  browseAll: string
  browseByState: string
  viewRecommendations: string
}

export function getShopActionCopy(locale: string): ShopActionCopy {
  if (locale === "zh") {
    return {
      addToBag: "\u52a0\u5165\u8d2d\u7269\u888b",
      addedToBag: "\u5df2\u52a0\u5165\u8d2d\u7269\u888b",
      viewDetails: "\u67e5\u770b\u8be6\u60c5",
      browseAll: "\u6d4f\u89c8\u5168\u90e8\u5546\u54c1",
      browseByState: "\u6309\u5f53\u524d\u72b6\u6001\u6311\u9009",
      viewRecommendations: "\u67e5\u770b\u4e3a\u4f60\u6311\u9009\u7684\u5546\u54c1",
    }
  }

  return {
    addToBag: "Add to bag",
    addedToBag: "Added to bag",
    viewDetails: "View details",
    browseAll: "Browse all objects",
    browseByState: "Browse by current state",
    viewRecommendations: "See your picks",
  }
}

export function getShopShelfProducts<T>(products: readonly T[], limit = 3): T[] {
  return products.slice(0, limit)
}
