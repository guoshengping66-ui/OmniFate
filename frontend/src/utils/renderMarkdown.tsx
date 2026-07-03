import { type JSX } from "react"

/** 渲染行内 markdown（加粗、代码等） */
function renderInline(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  // 匹配 **bold** 和 `code`
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="text-parchment-200 font-medium">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<code key={key++} className="px-1.5 py-0.5 bg-white/[0.06] rounded text-gold/70 text-xs">{match[3]}</code>)
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }
  return parts.length > 0 ? parts : [<span key="0">{text}</span>]
}

/**
 * Lightweight markdown → JSX renderer.
 * Supports: ##, ###, -, 1., →, **bold**, `code`, tables.
 */
export function renderMarkdown(raw: string): JSX.Element[] {
  const lines = raw.split("\n")
  const elements: JSX.Element[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 空行
    if (!trimmed) {
      i++
      continue
    }

    // 表格：收集连续的 | 行
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableRows: string[][] = []
      let j = i
      while (j < lines.length) {
        const row = lines[j].trim()
        if (!row.startsWith("|") || !row.endsWith("|")) break
        // 跳过分隔行 |---|---|
        if (/^\|[\s\-:|]+\|$/.test(row)) { j++; continue }
        const cells = row.split("|").slice(1, -1).map(c => c.trim())
        tableRows.push(cells)
        j++
      }
      if (tableRows.length > 0) {
        const isHeader = tableRows.length > 1
        elements.push(
          <div key={key++} className="overflow-x-auto my-4">
            <table className="w-full text-xs border-collapse">
              {isHeader && (
                <thead>
                  <tr>
                    {tableRows[0].map((cell, ci) => (
                      <th key={ci} className="px-3 py-2 text-left text-gold/80 font-medium border-b border-white/[0.06] bg-white/[0.03]">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(isHeader ? tableRows.slice(1) : tableRows).map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-parchment-400">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        i = j
        continue
      }
    }

    // 标题
    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-xl mt-8 mb-3 text-gold font-serif font-bold">{renderInline(trimmed.slice(3))}</h2>)
      i++; continue
    }
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={key++} className="text-lg mt-6 mb-2 text-gold/80 font-serif">{renderInline(trimmed.slice(4))}</h3>)
      i++; continue
    }

    // 无序列表
    if (trimmed.startsWith("- ")) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="space-y-1.5 my-3 ml-4">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-parchment-400 leading-relaxed list-disc list-inside">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // 有序列表
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
        i++
      }
      elements.push(
        <ol key={key++} className="space-y-1.5 my-3 ml-4">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-parchment-400 leading-relaxed list-decimal list-inside">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // 引用块
    if (trimmed.startsWith("→ ")) {
      elements.push(
        <p key={key++} className="text-gold/70 text-sm mt-4 mb-2 pl-4 border-l-2 border-gold/30 italic">
          {renderInline(trimmed.slice(2))}
        </p>
      )
      i++; continue
    }

    // 普通段落
    elements.push(<p key={key++} className="text-sm text-parchment-400 leading-relaxed mb-3">{renderInline(trimmed)}</p>)
    i++
  }

  return elements
}
