export interface LocationPlace {
  id: string
  display_name: string
  city?: string
  country?: string
  country_code?: string
  is_verified?: boolean
}

export function shouldSearchPlaces(query: string, country?: string) {
  const text = query.trim()
  return text.length >= 2 ? { query: text, country } : null
}

export function compactPlaces<T extends LocationPlace>(places: T[]): T[] {
  return Array.from(new Map(places.map(place => [place.display_name, place])).values()).slice(0, 6)
}

export function toVerifiedSelection<T extends LocationPlace>(place: T) {
  return { value: place.display_name, verified: true, place }
}

export function manualSelection(value: string) {
  return { value, verified: false }
}

export function nextCountryState<T>(_: { items: T[]; country?: string }, country?: string) {
  return { items: [] as T[], country }
}
