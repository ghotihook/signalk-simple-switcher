# Simple Switcher for Signal K

A plain row of tabs for flipping between your Signal K webapps (or any web page)
with one tap. Made for the helm tablet, phone or mast display that needs to show a
few different instrument pages.

![Freeboard chart with a tab bar along the bottom: two big-numbers pages, Freeboard and a racing app](public/screenshot-chart.jpg)

## Why

On a boat, one screen often has to show several things: a chart, a page of big
numbers, a race timer. Signal K already has webapps for all of these, but moving
between them means going back to a launcher, an icon grid or a dock. That's extra
taps and clutter on a small screen you're reading in spray and sunshine.

Simple Switcher puts the pages you use in a strip of labelled tabs and leaves the
rest of the screen to them.

## What it's good at

- **One tap between pages.** The tabs are always on screen. There are no menus and
  no icon grid.
- **Instant switching.** Pages stay loaded in the background, so a chart doesn't
  redraw from scratch and live data keeps flowing while a tab is hidden.
- **Pages, not just apps.** Add the same webapp more than once, each tab with its
  own path or settings. In the screenshots, one big-numbers app is two pages:
  *prestart* and *racing*.
- **Any web page.** A tab can be any URL on your network, such as a router status
  page, a camera or another server's dashboard.
- **Runs on old hardware.** It's one HTML file in old-style JavaScript with no
  build step and no dependencies, so it works on old tablets as well as any
  modern browser.

![The same big-numbers webapp configured as a racing page, selected in the tab bar](public/screenshot-racing.png)

## Install

Install **Simple Switcher** from the Signal K App Store, or run
`npm install signalk-simple-switcher` in `~/.signalk`. Then restart the server.

## Set up your tabs

Go to **Server → Plugin Config → Simple Switcher**, enable the plugin and set:

| Setting | What it does |
|---|---|
| **Tab bar position** | `bottom` (default) or `top`. |
| **Keep pages loaded** | On (default): visited pages stay alive, so switching is instant. Off: each page reloads when you select it, which is lighter on old or low-memory tablets. |
| **Tabs** | Add as many as you like, in the order you want them. |

For each tab:

- **Webapp**: pick an installed webapp from the list, or **Custom URL**.
- **Label**: the text on the tab. Keep it short so all tabs fit.
- **URL**:
  - for **Custom URL**, the full address, e.g. `http://192.168.1.10/`;
  - for a webapp, optional text added to the end of its address, e.g. `#2` or
    `?layout=race`, for apps that support it. This is how one app becomes
    several pages.

Use the arrows to reorder tabs and ✕ to remove one.

<img src="public/screenshot-config.png" width="560" alt="Plugin config with three tabs: two big-numbers pages opened by URL with different display settings, and Freeboard picked from the Webapp list">

The config above sets up the tabs in the screenshots. Both big-numbers tabs open
the same app with a different `?display=` setting, and Freeboard is picked from
the list of installed webapps. You could also set up the big-numbers tabs as
**Webapp** `signalk-bignumbers` with **URL** `instrument.html?display=racing`.
That doesn't depend on the server's hostname, so it keeps working if you reach
the server by IP address or a different name.

## Use it

Open `http://<your-server>:3000/signalk-simple-switcher/` on the display.

- Tap a tab to switch.
- Each device remembers the last tab it showed.
- Open a particular tab directly with `#1`, `#2`, … on the end of the address.
  This is handy for bookmarks, or for giving each display its own start page.
- On a phone or tablet, use **Add to Home Screen** to get it full screen without
  the browser bar.
- After changing the config, reload the page to pick up the new tabs.

## Good to know

- **Page size.** Each page fills the screen above (or below) the tab bar and sizes
  itself as if that area were the whole window. Responsive apps fit exactly. A
  page built for a fixed desktop width will scroll rather than shrink.
- **Some sites won't show.** Tabs are iframes, and external sites that forbid
  embedding (`X-Frame-Options` / `frame-ancestors`) show as blank. The plugin
  can't work around that.
- **Tabs of the same app share its settings.** Two tabs of one webapp share its
  browser storage. An app that saves its layout in the browser will show the same
  layout in both tabs, unless it lets you choose one in the URL.
- **Memory.** With **Keep pages loaded** on, every visited tab stays in memory. On
  an old tablet with many heavy tabs (e.g. several charts), turn it off.

## License

Apache-2.0
