const CUSTOM = 'Custom URL'

module.exports = function (app) {
  const plugin = {
    id: 'signalk-simple-switcher',
    name: 'Simple Switcher',
    description: 'Tab bar for switching between webapps and web pages'
  }

  // Installed webapps, used to populate the dropdown in the plugin config
  function webappNames () {
    const all = [].concat(app.webapps || [], app.embeddablewebapps || [])
    const names = all
      .map((w) => w && w.name)
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
