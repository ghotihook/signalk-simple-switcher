# Changelog

## 0.1.1

- Fix: the **Webapp** dropdown in the plugin config only offered "Custom URL".
  Installed webapps are now found by scanning `node_modules`, since the server
  gives plugins their `app` before it has loaded webapps.
- Add tests (`npm test`, Node's built-in test runner, no dependencies).
- Add App Store screenshot and this changelog.

## 0.1.0

- First release: tab bar (top or bottom) for switching between Signal K webapps
  and web pages, with optional keep-loaded pages and `#n` deep links.
