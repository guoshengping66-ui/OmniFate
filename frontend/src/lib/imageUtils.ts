/**
 * Image compression utility for mobile uploads.
 *
 * Mobile photos are often 4000x3000+ pixels and 5-10MB.
 * Compressing to ~1024px max dimension and 0.8 quality reduces
 * upload size to ~100-300KB while maintaining sufficient quality
 * for MediaPipe face/palm landmark detection.
 */

const MAX_DIMENSION = 1024
const JPEG_QUALITY = 0.85

export async function compressImage(file: File): Promise<File> {
  // Skip compression for small files (< 500KB)
  if (file.size < 500 * 1024) {
    return file
  }

  // Skip non-image types that canvas can't handle
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file
  }

  try {
    const img = await loadImage(file)
    const needsResize =
      img.width > MAX_DIMENSION || img.height > MAX_DIMENSION

    if (!needsResize && file.size < 1024 * 1024) {
      return file
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    if (!ctx) return file

    let { width, height } = img
    if (needsResize) {
      const scale = MAX_DIMENSION / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY)
    if (!blob) return file

    // Only use compressed version if it's actually smaller
    if (blob.size >= file.size) {
      return file
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image"))
    }
    img.src = URL.createObjectURL(file)
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}
