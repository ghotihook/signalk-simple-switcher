const fs = require('fs')
const path = require('path')

const CUSTOM = 'Custom URL'
const WEBAPP_KEYWORDS = ['signalk-webapp', 'signalk-embeddable-webapp']

// Webapp package names in a node_modules dir, including @scoped ones
function scanNodeModules (dir) {
  let entries
  try {
    entries = fs.readdirSync(dir)
  } catch (e) {
    return []
  }
  return entries.reduce((names, entry) => {
    if (entry.startsWith('.')) return names
    if (entry.startsWith('@')) return names.concat(scanNodeModules(path.join(dir, entry)))
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, entry, 'package.json'), 'utf8'))
      if ((pkg.keywords || []).some((k) => WEBAPP_KEYWORDS.includes(k))) names.push(pkg.name)
    } catch (e) {}
    return names
  }, [])
}

module.exports = function (app) {
  const plugin = {
    id: 'signalk-simple-switcher',
    name: 'Simple Switcher',
    description: 'Tab bar for switching between webapps and web pages'
  }

  // Installed webapps, used to populate the dropdown in the plugin config.
  // The server hands plugins a shallow copy of app before webapps are loaded,
  // so app.webapps is normally empty here; scan node_modules the way the
  // server does (config dir, then app dir).
  function webappNames () {
    const config = app.config || {}
    const dirs = [config.configPath, config.appPath]
      .filter(Boolean)
      .map((p) => path.join(p, 'node_modules'))
    const scanned = [].concat.apply([], Array.from(new Set(dirs)).map(scanNodeModules))
    const known = [].concat(app.webapps || [], app.embeddablewebapps || [])
      .map((w) => w && w.name)
    const names = scanned.concat(known)
      .filter((n) => n && n !== plugin.id)
    return Array.from(new Set(names)).sort()
  }

  function tabs () {
    let options = {}
    try {
      options = app.readPluginOptions().configuration || {}
    } catch (e) {}
    return {
      position: options.position === 'top' ? 'top' : 'bottom',
      keepLoaded: options.keepLoaded !== false,
      tabs: (options.tabs || [])
        .map((t) => {
          const url = t.app && t.app !== CUSTOM
            ? '/' + t.app + '/' + (t.url || '')
            : (t.url || '')
          return { label: t.label || (t.app && t.app !== CUSTOM ? t.app : url), url }
        })
        .filter((t) => t.url)
    }
  }

  plugin.schema = () => ({
    type: 'object',
    properties: {
      position: {
        type: 'string',
        title: 'Tab bar position',
        enum: ['bottom', 'top'],
        default: 'bottom'
      },
      keepLoaded: {
        type: 'boolean',
        title: 'Keep pages loaded in the background (instant switching; turn off on low-memory devices)',
        default: true
      },
      tabs: {
        type: 'array',
        title: 'Tabs',
        items: {
          type: 'object',
          required: ['app'],
          properties: {
            label: { type: 'string', title: 'Label' },
            app: {
              type: 'string',
              title: 'Webapp',
              enum: [CUSTOM].concat(webappNames()),
              default: CUSTOM
            },
            url: {
              type: 'string',
              title: 'URL (for Custom URL) or path/query appended to the webapp, e.g. ?page=2'
            }
          }
        }
      }
    }
  })

  plugin.registerWithRouter = (router) => {
    router.get('/tabs', (req, res) => {
      res.set('Cache-Control', 'no-store')
      res.json(tabs())
    })
  }

  plugin.start = () => {}
  plugin.stop = () => {}

  return plugin
}
