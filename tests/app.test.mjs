import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appPath = new URL("../app.js", import.meta.url);
const source = fs.readFileSync(appPath, "utf8");

function runWithDate(savedState = null) {
  const elements = new Map();
  const downloads = { items: [] };
  const selectors = ["#timezone", "#safe-deadline", "#rules-deadline", "#progress-count", "#requirements-progress", "#quick-list", "#requirements-table", "#source-list", "#window-result", "#project-name", "#start-date", "#export-report", "#conflict-count", "#conflict-list"];
  for (const selector of selectors) elements.set(selector, { value: "", textContent: "", innerHTML: "", className: "", handlers: {}, addEventListener(event, handler) { this.handlers[event] = handler; }, click() { this.handlers.click?.({ currentTarget: this }); } });
  const nav = ["overview", "requirements", "sources"].map((view) => ({ dataset: { view }, classList: { toggle() {} }, addEventListener() {} }));
  const views = ["overview", "requirements", "sources"].map((view) => ({ id: `view-${view}`, classList: { toggle() {} }, set hidden(value) { this.isHidden = value; } }));
  const document = {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: (selector) => selector === "[data-view]" ? nav : selector === ".view" ? views : [],
    createElement: (tagName) => ({ tagName, addEventListener() {}, click() { downloads.items.push(this); } })
  };
  const sandbox = {
    document,
    window: {},
    Blob: class { constructor(parts, options) { this.parts = parts; this.options = options; downloads.blob = this; } },
    URL: { createObjectURL: () => "blob:test", revokeObjectURL: (url) => { downloads.revoked = url; } },
    localStorage: { getItem: () => savedState ? JSON.stringify(savedState) : null, setItem() {} },
    Intl,
    Date,
    JSON,
    console,
    setTimeout: (callback) => { downloads.revokeLater = callback; },
    clearTimeout
  };
  vm.runInNewContext(source, sandbox);
  elements.audit = sandbox.window.RuleBridge;
  elements.downloads = downloads;
  return elements;
}

const elements = runWithDate();
assert.match(elements.get("#safe-deadline").textContent, /Nov 21, 2026/);
assert.match(elements.get("#rules-deadline").textContent, /Nov 21, 2026/);
assert.match(elements.get("#safe-deadline").textContent, /3:45 PM/);
assert.match(elements.get("#rules-deadline").textContent, /3:59 PM/);
assert.match(elements.get("#quick-list").innerHTML, /Public GitHub repository or source code/);
assert.equal((elements.get("#requirements-table").innerHTML.match(/Required/g) || []).length, 5);
assert.match(elements.get("#source-list").innerHTML, /Official rules/);
const pacific = runWithDate({ zone: "America/Los_Angeles" });
assert.match(pacific.get("#safe-deadline").textContent, /Nov 20, 2026, 11:45 PM PST/);
assert.match(pacific.get("#rules-deadline").textContent, /Nov 20, 2026, 11:59 PM PST/);
const audit = runWithDate({ name: "Test | packet", start: "2026-11-15", zone: "Asia/Shanghai", checked: { title: true } }).audit.buildAuditPacket(new Date("2026-11-15T12:00:00.000Z"));
assert.match(audit, /Working project name: Test packet/);
assert.match(audit, /Required checklist: 1\/5 marked complete/);
assert.match(audit, /\[x\] Project name/);
assert.match(audit, /\[ \] Team member information/);
assert.match(audit, /Deadline difference: 14 minutes/);
assert.match(audit, /Student eligibility differs/);
assert.match(audit, /not proof of when work began/);
assert.match(audit, /Checklist state and project notes were not sent/);
const exportState = runWithDate({ name: "Demo", checked: {} });
exportState.get("#export-report").click();
assert.equal(exportState.downloads.items.length, 1);
assert.equal(exportState.downloads.items[0].tagName, "a");
assert.equal(exportState.downloads.items[0].href, "blob:test");
assert.equal(exportState.downloads.items[0].download, "rulebridge-bridge-the-gap-audit.md");
assert.equal(exportState.downloads.blob.options.type, "text/markdown;charset=utf-8");
assert.match(exportState.downloads.blob.parts[0], /RuleBridge audit packet/);
exportState.downloads.revokeLater();
assert.equal(exportState.downloads.revoked, "blob:test");
const conflictApi = runWithDate().audit.findConflicts;
assert.equal(conflictApi().length, 2);
assert.equal(conflictApi([{ key: "deadline", label: "Deadline", value: "same" }, { key: "deadline", label: "Deadline", value: "same" }]).length, 0);
assert.equal(conflictApi([{ key: "deadline", label: "Deadline", value: "one" }, { key: "deadline", label: "Deadline", value: "two" }]).length, 1);
console.log("RuleBridge checks passed (deadline conversion, sourced requirements, conflict notes, audit export).");
