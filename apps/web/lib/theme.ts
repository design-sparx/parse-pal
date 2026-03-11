export const THEME_STORAGE_KEY = "parsepal-theme"
export const THEME_EVENT_NAME = "parsepal-theme-change"

export type Theme = "light" | "dark"

type ResolveThemeOptions = {
  storedTheme: string | null
  systemPrefersDark: boolean
}

type ThemeRoot = Pick<DOMTokenList, "toggle">
type ThemeStorage = Pick<Storage, "getItem" | "setItem">
type ThemeMediaQueryList = Pick<MediaQueryList, "matches">

export function sanitizeStoredTheme(value: string | null | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null
}

export function resolveTheme({
  storedTheme,
  systemPrefersDark,
}: ResolveThemeOptions): Theme {
  const savedTheme = sanitizeStoredTheme(storedTheme)
  if (savedTheme) return savedTheme
  return systemPrefersDark ? "dark" : "light"
}

export function applyTheme(theme: Theme, root: ThemeRoot = document.documentElement.classList) {
  root.toggle("dark", theme === "dark")
}

export function readStoredTheme(storage: ThemeStorage = window.localStorage) {
  return sanitizeStoredTheme(storage.getItem(THEME_STORAGE_KEY))
}

export function getSystemTheme(
  mediaQueryList: ThemeMediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
): Theme {
  return mediaQueryList.matches ? "dark" : "light"
}

export function resolveCurrentTheme(storage?: ThemeStorage, mediaQueryList?: ThemeMediaQueryList) {
  return resolveTheme({
    storedTheme: readStoredTheme(storage),
    systemPrefersDark: (mediaQueryList ?? window.matchMedia("(prefers-color-scheme: dark)")).matches,
  })
}

export function persistTheme(theme: Theme, storage: ThemeStorage = window.localStorage) {
  storage.setItem(THEME_STORAGE_KEY, theme)
}

export function dispatchThemeChange(theme: Theme) {
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT_NAME, { detail: theme }))
}

export function setTheme(theme: Theme, storage: ThemeStorage = window.localStorage) {
  persistTheme(theme, storage)
  applyTheme(theme)
  dispatchThemeChange(theme)
}

export function getThemeInitScript() {
  return `(function(){var storageKey=${JSON.stringify(THEME_STORAGE_KEY)};var d=document.documentElement;var m=window.matchMedia('(prefers-color-scheme: dark)');function sanitize(v){return v==='light'||v==='dark'?v:null}function apply(t){d.classList.toggle('dark',t==='dark')}function readStoredTheme(){try{return sanitize(window.localStorage.getItem(storageKey))}catch{return null}}function resolveTheme(prefersDark){var storedTheme=readStoredTheme();if(storedTheme)return storedTheme;return prefersDark?'dark':'light'}apply(resolveTheme(m.matches));m.addEventListener('change',function(e){if(readStoredTheme())return;apply(resolveTheme(e.matches))})})()`
}
