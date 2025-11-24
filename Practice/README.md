# Textbox Overlay Chrome Extension

A Chrome extension that allows users to add custom textbox overlays to any website. Perfect for taking notes, annotations, or adding temporary text fields.

## Features

- 🎯 Click-to-place textbox functionality
- 📝 Draggable and resizable textboxes
- 💾 Auto-save textboxes per website (persists across sessions)
- 🗑️ Easy deletion of individual textboxes or clear all at once
- 🎨 Clean, modern UI with smooth interactions

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Click "Add Textbox" button
3. Click anywhere on the webpage to place a textbox
4. Drag textboxes by the header bar
5. Resize textboxes by dragging the bottom-right corner
6. Close individual textboxes with the × button
7. Use "Clear All Textboxes" to remove all textboxes from the current page

## File Structure

```
chrome-textbox-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── content.js            # Content script for textbox functionality
├── content.css           # Textbox styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Creating Icons

You'll need to create three icon sizes for the extension. You can use any image editing tool or online icon generator:

- 16x16 pixels (toolbar icon)
- 48x48 pixels (extension management)
- 128x128 pixels (Chrome Web Store)

Create an `icons` folder in the extension directory and add these three PNG files.

## Development

The extension uses:
- **Manifest V3** - Latest Chrome extension API
- **Chrome Storage API** - Persist textboxes per URL
- **Content Scripts** - Inject functionality into web pages
- **Vanilla JavaScript** - No external dependencies

## Customization

You can customize the appearance by editing `content.css`:
- Change colors in `.textbox-overlay-container` and `.textbox-overlay-header`
- Adjust default size with `min-width` and `min-height`
- Modify shadows and borders for different styling

## Permissions

- `activeTab` - Access the current tab to inject textboxes
- `storage` - Save textbox data locally

## Browser Compatibility

This extension is designed for Chrome and Chromium-based browsers (Edge, Brave, Opera) using Manifest V3.

## License

MIT License - Feel free to modify and distribute as needed.