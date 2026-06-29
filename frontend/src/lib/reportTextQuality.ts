const MOJIBAKE_CHARS = /[�鈥銆鍥涓浜鏃琛绾瑙鐩褰浣馃锛俙鏈闈濡婊闆绐怽慭]/g
const USEFUL_CJK = /[\u4e00-\u9fff]/

export function isLikelyGarbled(text = ""): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const suspicious = trimmed.match(MOJIBAKE_CHARS)?.length || 0
  if (suspicious >= 3 && suspicious / Math.max(1, trimmed.length) > 0.12) return true
  if (/[�]{1,}/.test(trimmed)) return true
  return false
}

export function normalizeReportText(text = ""): string {
  return text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```\w*\s*[\s\S]*?```/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/#-+/g, "")
    .replace(/^#+\s*$/gm, "")
    .replace(/^\s*[-*+]\s+(?=[#-])/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function cleanVisibleReportText(text = ""): string {
  const clean = normalizeReportText(text)
  const lines = clean
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !isLikelyGarbled(line))
    .filter(line => !/^(null|undefined|nan)$/i.test(line))
    .filter(line => !/^[{}\[\],:"\s]+$/.test(line))
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

export function firstReadableSentence(text = "", maxLength = 140): string {
  const clean = cleanVisibleReportText(text)
  const sentence = clean
    .split(/[。！？.!?\n]/)
    .map(item => item.trim())
    .find(item => item.length > 8 && (USEFUL_CJK.test(item) || /[a-z]/i.test(item))) || clean
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength)}...` : sentence
}

export function splitReadableParagraphs(text = "", limit = 8): string[] {
  return cleanVisibleReportText(text)
    .split(/\n{2,}|\n(?=\d+[.、]\s)|\n(?=[一二三四五六七八九十]+[、.]\s)/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .filter(item => !isLikelyGarbled(item))
    .slice(0, limit)
}
