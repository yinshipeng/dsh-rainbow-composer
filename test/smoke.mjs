/**
 * Smoke test for dsh-rainbow-composer.
 *
 * The browser half is loaded as a real script against a minimal stand-in for
 * the page module loader and the DOM. The Host half is imported and applied
 * against an empty context. No DSH process is required.
 *
 * Run with: node test/smoke.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/** Stylesheets appended to the fake document head. */
const appended = []
/** Stylesheets removed through their cleanup. */
const removed = []

globalThis.window = {
  __ModuleLoader__: {
    load(spec) {
      globalThis.__rainbowSpec = spec
    },
  },
}

globalThis.document = {
  createElement(tag) {
    return {
      tag,
      attrs: {},
      style: {},
      textContent: '',
      setAttribute(name, value) {
        this.attrs[name] = value
      },
      remove() {
        removed.push(this)
      },
    }
  },
  head: {
    appendChild(node) {
      appended.push(node)
    },
  },
}

// 1. The browser artifact registers the lazy factory under the package name.
await import('../client.js')
const spec = globalThis.__rainbowSpec
assert.ok(spec !== undefined, 'client.js registered a module')
assert.equal(spec.id, 'dsh-rainbow-composer')
assert.equal(typeof spec.factory, 'function')

const plugin = spec.factory()
assert.deepEqual(plugin.inject, ['slots'])
assert.equal(typeof plugin.apply, 'function')

// 2. Applying it injects the stylesheet and registers the load beacon.
const state = { slot: undefined, options: undefined, component: undefined, cleanups: [] }
const ctx = {
  effect(callback) {
    const dispose = callback()
    state.cleanups.push(dispose)
    return dispose
  },
  slots: {
    inject(slot, callback) {
      state.slot = slot
      state.injection = callback()
      return () => {}
    },
    register(options, component) {
      state.options = options
      state.component = component
      return () => {}
    },
  },
}
plugin.apply(ctx)

assert.equal(state.slot, 'conversation.composer.dock')
assert.equal(state.options.id, 'rainbow-composer')
assert.equal(state.options.name, 'conversation.composer.dock')
assert.equal(typeof state.component, 'function')
assert.equal(state.component({}), null, 'the beacon renders nothing')

assert.equal(appended.length, 1, 'exactly one stylesheet is injected')
const style = appended[0]
assert.equal(style.tag, 'style')
assert.equal(style.attrs['data-dsh-plugin'], 'rainbow-composer')
for (const fragment of [
  '@property --dsh-rb-angle',
  'conic-gradient',
  'mask-composite: exclude',
  'prefers-reduced-motion',
  'pointer-events: none',
]) {
  assert.ok(style.textContent.includes(fragment), `stylesheet contains ${fragment}`)
}

// 3. Disposal removes the stylesheet and the module owns no network calls.
for (const dispose of state.cleanups) {
  if (typeof dispose === 'function') dispose()
}
assert.deepEqual(removed, [style], 'disposal removes the injected stylesheet')

const clientSource = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
for (const forbidden of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'sendBeacon']) {
  assert.ok(!clientSource.includes(forbidden), `client.js makes no ${forbidden} call`)
}

// 4. The Host half applies as a no-op.
const host = await import('../index.js')
assert.equal(typeof host.apply, 'function')
host.apply({})

console.log('rainbow smoke: all checks passed')