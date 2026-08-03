export function shouldClearShopCart(
  paymentStatus: string | null,
  returnedOrderNo: string | null,
  pendingShopOrderNo: string | null,
): boolean {
  return paymentStatus === "success"
    && Boolean(returnedOrderNo)
    && returnedOrderNo === pendingShopOrderNo
}
