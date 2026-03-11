import test from "node:test"
import assert from "node:assert/strict"

import {
  resolveTheme,
  sanitizeStoredTheme,
  THEME_STORAGE_KEY,
} from "./theme.ts"

test("saved dark theme overrides a light system preference", () => {
  const theme = resolveTheme({
    storedTheme: "dark",
    systemPrefersDark: false,
  })

  assert.equal(theme, "dark")
})

test("saved light theme overrides a dark system preference", () => {
  const theme = resolveTheme({
    storedTheme: "light",
    systemPrefersDark: true,
  })

  assert.equal(theme, "light")
})

test("system preference is used when no saved theme exists", () => {
  const theme = resolveTheme({
    storedTheme: null,
    systemPrefersDark: true,
  })

  assert.equal(theme, "dark")
})

test("invalid saved themes are ignored", () => {
  assert.equal(sanitizeStoredTheme("system"), null)
  assert.equal(sanitizeStoredTheme(""), null)
  assert.equal(sanitizeStoredTheme("dark"), "dark")
})

test("theme storage key stays stable", () => {
  assert.equal(THEME_STORAGE_KEY, "parsepal-theme")
})
