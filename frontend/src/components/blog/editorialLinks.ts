export function getEditorialLinks<T extends { id: string }>(relatedIds: string[], byId: Map<string, T>): T[] {
  return relatedIds.flatMap((id) => {
    const article = byId.get(id)
    return article ? [article] : []
  })
}
