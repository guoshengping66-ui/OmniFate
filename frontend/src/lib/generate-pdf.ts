/**
 * Generate a PDF report from a reading.
 * Uses html2canvas to capture a styled DOM node, then jsPDF to build the PDF.
 */
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface GeneratePdfOptions {
  /** The DOM element to capture */
  element: HTMLElement
  /** Filename without extension */
  filename?: string
  /** Page orientation */
  orientation?: "portrait" | "landscape"
}

export async function generateReadingPdf({
  element,
  filename = "profile-mirror-report",
  orientation = "portrait",
}: GeneratePdfOptions): Promise<void> {
  // Capture the element as a high-res canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#0d0820",
    logging: false,
    windowWidth: 800,
  })

  const imgData = canvas.toDataURL("image/png")
  const imgWidth = canvas.width
  const imgHeight = canvas.height

  // A4 dimensions in mm
  const pdfWidth = orientation === "portrait" ? 210 : 297
  const pdfHeight = orientation === "portrait" ? 297 : 210

  // Calculate how many pages we need
  const contentWidth = pdfWidth - 20 // 10mm margin each side
  const scaledHeight = (imgHeight / imgWidth) * contentWidth

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  if (scaledHeight <= pdfHeight - 20) {
    // Fits on one page
    pdf.addImage(imgData, "PNG", 10, 10, contentWidth, scaledHeight)
  } else {
    // Multi-page: slice the canvas
    const pageContentHeight = pdfHeight - 20
    const sourceSliceHeight = (pageContentHeight / scaledHeight) * imgHeight
    let remainingHeight = imgHeight
    let sourceY = 0
    let page = 0

    while (remainingHeight > 0) {
      if (page > 0) pdf.addPage()

      const sliceHeight = Math.min(sourceSliceHeight, remainingHeight)

      // Create a temporary canvas for this slice
      const sliceCanvas = document.createElement("canvas")
      sliceCanvas.width = imgWidth
      sliceCanvas.height = sliceHeight
      const ctx = sliceCanvas.getContext("2d")!
      ctx.drawImage(canvas, 0, sourceY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight)

      const sliceData = sliceCanvas.toDataURL("image/png")
      const sliceScaledHeight = (sliceHeight / imgWidth) * contentWidth

      pdf.addImage(sliceData, "PNG", 10, 10, contentWidth, sliceScaledHeight)

      sourceY += sliceHeight
      remainingHeight -= sliceHeight
      page++
    }
  }

  pdf.save(`${filename}.pdf`)
}
