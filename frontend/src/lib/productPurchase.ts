export type ProductPurchaseIntent = "add_and_checkout" | "add_to_cart"

export interface ProductPurchaseAction {
  intent: ProductPurchaseIntent
  label: string
}

export function getProductPurchaseActions(locale: string): {
  primary: ProductPurchaseAction
  secondary: ProductPurchaseAction
} {
  const isEnglish = locale === "en"

  return {
    primary: {
      intent: "add_and_checkout",
      label: isEnglish ? "Add & checkout" : "\u52a0\u5165\u5e76\u7ed3\u7b97",
    },
    secondary: {
      intent: "add_to_cart",
      label: isEnglish ? "Add to cart" : "\u52a0\u5165\u8d2d\u7269\u8f66",
    },
  }
}
