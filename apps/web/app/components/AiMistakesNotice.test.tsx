import test from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"

import { AiMistakesNotice } from "./AiMistakesNotice"

test("renders the AI disclaimer copy", () => {
  const markup = renderToStaticMarkup(<AiMistakesNotice />)

  assert.match(markup, /AI can make mistakes\./)
  assert.match(markup, /Verify important details\./)
})
