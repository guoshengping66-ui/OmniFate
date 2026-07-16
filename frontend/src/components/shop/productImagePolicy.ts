export type ProductImageSize = "sm" | "md" | "lg"

const IMAGE_SIZES: Record<ProductImageSize, string> = {
  sm: "64px",
  md: "80px",
  lg: "256px",
}

export function getProductImagePolicy(size: ProductImageSize, priority = false) {
  return {
    sizes: IMAGE_SIZES[size],
    loading: priority ? "eager" : "lazy",
  } as const
}
