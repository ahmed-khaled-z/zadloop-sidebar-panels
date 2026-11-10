# ZadLoop sidebar panels

Choose which panels show in the ZadLoop sidebar and which move into its **More** menu.

- Open **More** under the sidebar's panel list. A new section lists every panel:
  - **In More** — hidden panels. Click a name to open it, or the up arrow to bring it back to the sidebar.
  - **In the sidebar** — visible panels. The down arrow moves one into More.
- Your choices are remembered across reloads and shared between open tabs.
- English and Arabic UI.

**Plugins** always stays in the sidebar; ZadLoop does not allow hiding it.

## Install

In ZadLoop, open **Plugins → Add plugin → Install a third-party plugin** and enter:

```
https://github.com/ahmed-khaled-z/zadloop-sidebar-panels
```

## Limitations

ZadLoop's sidebar keeps hidden panels in memory only. To restore your choices after a reload, the plugin uses an undocumented part of the sidebar. If a ZadLoop update changes it, moving panels keeps working but hidden panels return to the sidebar after a reload.

Choices are stored in the app's browser storage on your machine.

## Requirements

ZadLoop (DSH) `0.2.2-rc.1` or newer.

## License

[MIT](LICENSE)
