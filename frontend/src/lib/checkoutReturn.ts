export function shouldClearShopCart(
  stripeStatus: string | null,
  returnedOrderNo: string | null,
  pendingShopOrderNo: string | null,
): boolean {
  return stripeStatus === "success"
    && Boolean(returnedOrderNo)
    && returnedOrderNo === pendingShopOrderNo
}
