import AsyncStorage from '@react-native-async-storage/async-storage'
import { Uniwind } from 'uniwind'

export const ACCENT_STORAGE_KEY = 'accent'

type Shade = { primary: string; foreground: string }

// Each accent has a bright shade for dark and a deeper one for light, so text and
// fills stay at 4.5:1 or better in both themes. No green, amber or red: those
// already mean owed, owe and delete.
export const ACCENTS = [
  {
    id: 'lime',
    label: 'Lime',
    dark: { primary: '#c8f169', foreground: '#121405' },
    light: { primary: '#46720d', foreground: '#ffffff' },
  },
  {
    id: 'sky',
    label: 'Sky',
    dark: { primary: '#7cc8ff', foreground: '#04131f' },
    light: { primary: '#0b5f8f', foreground: '#ffffff' },
  },
  {
    id: 'violet',
    label: 'Violet',
    dark: { primary: '#c4a7ff', foreground: '#160a2b' },
    light: { primary: '#6d3fc4', foreground: '#ffffff' },
  },
  {
    id: 'pink',
    label: 'Pink',
    dark: { primary: '#ff9ccf', foreground: '#2b0718' },
    light: { primary: '#b0306f', foreground: '#ffffff' },
  },
] as const satisfies readonly { id: string; label: string; dark: Shade; light: Shade }[]

export type AccentId = (typeof ACCENTS)[number]['id']

export const DEFAULT_ACCENT: AccentId = 'lime'

export function getAccent(id: string | null | undefined) {
  return ACCENTS.find(a => a.id === id) ?? ACCENTS[0]
}

const toVars = ({ primary, foreground }: Shade) => ({
  '--color-primary': primary,
  '--color-primary-foreground': foreground,
  '--color-ring': primary,
})

let current: AccentId = DEFAULT_ACCENT

export function getCurrentAccent() {
  return current
}

// Overrides the primary tokens in both themes; every accent-colored class follows
export function applyAccent(id: string | null | undefined) {
  const accent = getAccent(id)
  current = accent.id
  Uniwind.updateCSSVariables('light', toVars(accent.light))
  Uniwind.updateCSSVariables('dark', toVars(accent.dark))
  return accent.id
}

export async function setAccent(id: AccentId) {
  applyAccent(id)
  await AsyncStorage.setItem(ACCENT_STORAGE_KEY, id).catch(() => {})
}

export async function loadAccent(): Promise<AccentId> {
  const saved = await AsyncStorage.getItem(ACCENT_STORAGE_KEY).catch(() => null)
  return applyAccent(saved)
}
