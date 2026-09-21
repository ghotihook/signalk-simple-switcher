const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const createPlugin = require('..')

function mockApp (options) {
  return {
    webapps: [{ name: 'kip' }, { name: 'signalk-simple-switcher' }],
    embeddablewebapps: [{ name: 'kip' }, { name: 'freeboard-sk' }],
    readPluginOptions: () => ({ configuration: options })
  }
}

// Default config the way the server/registry builds it from the schema
function defaults (schema) {
  const config = {}
  for (const [key, prop] of Object.entries(schema.properties)) {
    if ('default' in prop) config[key] = prop.default
  }
  return config
}

function getTabs (plugin) {
  let handler
  plugin.registerWithRouter({ get: (path, fn) => { if (path === '/tabs') handler = fn } })
  assert.ok(handler, '/tabs route registered')
  let body
  handler({}, { set () {}, json (b) { body = b } })
  return body
}

describe('signalk-simple-switcher', () => {
  it('returns a valid plugin object', () => {
    const plugin = createPlugin(mockApp())
    assert.equal(plugin.id, 'signalk-simple-switcher')
    assert.equal(typeof plugin.name, 'string')
    assert.equal(typeof plugin.start, 'function')
    assert.equal(typeof plugin.stop, 'function')
  })

  it('exposes a schema with defaults and lists installed webapps', () => {
    const schema = createPlugin(mockApp()).schema()
    assert.equal(schema.type, 'object')
    assert.equal(schema.properties.position.default, 'bottom')
    assert.equal(schema.properties.keepLoaded.default, true)
    assert.deepEqual(schema.properties.tabs.items.properties.app.enum,
      ['Custom URL', 'freeboard-sk', 'kip'])
  })

  it('finds installed webapps in node_modules like the server does', () => {
    const os = require('os')
    const fs = require('fs')
    const path = require('path')
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sk-switcher-'))
    const install = (dir, name, keywords) => {
      const d = path.join(root, dir, 'node_modules', name)
      fs.mkdirSync(d, { recursive: true })
      fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name, keywords }))
    }
    try {
      install('config', 'kip', ['signalk-webapp'])
      install('config', '@scope/panel', ['signalk-embeddable-webapp'])
      install('config', 'some-plugin', ['signalk-node-server-plugin'])
      install('config', 'signalk-simple-switcher', ['signalk-webapp'])
      install('app', '@signalk/freeboard-sk', ['signalk-webapp'])
      install('app', 'kip', ['signalk-webapp'])
      // Mirrors the server: plugins get app before webapps are loaded
      const plugin = createPlugin({
        config: { configPath: path.join(root, 'config'), appPath: path.join(root, 'app') }
      })
      assert.deepEqual(plugin.schema().properties.tabs.items.properties.app.enum,
        ['Custom URL', '@scope/panel', '@signalk/freeboard-sk', 'kip'])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('starts and stops with schema defaults', () => {
    const plugin = createPlugin(mockApp())
    plugin.start(defaults(plugin.schema()))
    plugin.stop()
  })

  it('works when the app has no webapps or options', () => {
    const plugin = createPlugin({ readPluginOptions: () => { throw new Error('none') } })
    assert.deepEqual(plugin.schema().properties.tabs.items.properties.app.enum, ['Custom URL'])
    assert.deepEqual(getTabs(plugin), { position: 'bottom', keepLoaded: true, tabs: [] })
  })

  it('builds tab URLs from config', () => {
    const plugin = createPlugin(mockApp({
      position: 'top',
      keepLoaded: false,
      tabs: [
        { app: 'kip', label: 'Dash' },
        { app: 'kip', url: '#2' },
        { app: 'Custom URL', label: 'Router', url: 'http://192.168.1.1/' },
        { app: 'Custom URL', label: 'Empty' }
      ]
    }))
    assert.deepEqual(getTabs(plugin), {
      position: 'top',
      keepLoaded: false,
      tabs: [
        { label: 'Dash', url: '/kip/' },
        { label: 'kip', url: '/kip/#2' },
        { label: 'Router', url: 'http://192.168.1.1/' }
      ]
    })
  })
})
