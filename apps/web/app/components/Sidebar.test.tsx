import test from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"

import appPackage from "../../../../package.json"
import { Sidebar } from "./Sidebar"

test("renders the app version in the quiet footer metadata area", () => {
  const markup = renderToStaticMarkup(
    <Sidebar
      conversations={[]}
      activeId={null}
      onSelect={() => {}}
      onDelete={() => {}}
      onToggle={() => {}}
      onNewChat={() => {}}
    />
  )

  const openSourceIndex = markup.indexOf("Open Source")
  const versionLabelIndex = markup.indexOf("Version")
  const versionValueIndex = markup.indexOf(`v${appPackage.version}`)

  assert.notEqual(openSourceIndex, -1)
  assert.notEqual(versionLabelIndex, -1)
  assert.notEqual(versionValueIndex, -1)
  assert.ok(versionLabelIndex > openSourceIndex)
  assert.ok(versionValueIndex > versionLabelIndex)
})
