# QuickDrop

**Drag-and-drop form filler. Fill forms faster with your saved information.**

QuickDrop lets you enter your information once, then drag-and-drop or click-to-paste it into any form field. No more retyping, no more broken autofill, no more capitalization errors.

## ✨ Features

- **One-time setup** - Enter your info once, use it everywhere
- **Drag & drop** - Drag any data block directly into form fields
- **Click to paste** - Click a block to paste into the focused field
- **Right-click menu** - Right-click any input field for quick insertion
- **Auto-capitalization** - Automatically fixes name capitalization (ADHEL → Adhel)
- **Works everywhere** - Compatible with React, Angular, and vanilla HTML forms
- **100% local** - All data stored locally, no cloud, no tracking

## 🎯 How It Works

1. **First Install**: Extension opens setup page automatically
2. **Fill your info**: Enter name, email, address, education, work experience, links
3. **Use anywhere**: 
   - Open extension popup
   - Drag a data block onto any form field
   - Or click a block to paste into focused field
   - Or right-click an input → "Insert from QuickDrop"

## 📦 Installation

**Note**: This extension uses Chrome's Side Panel API, which requires Chrome 114 or later. The side panel stays open during drag-and-drop operations, unlike traditional popups.

### Step 1: Generate Icons (Required)

Before loading the extension, you need to create icon files:

1. Open `generate-icons.html` in your browser
2. Click "Generate All Icons" 
3. Save the downloaded PNG files to the `icons/` folder:
   - `icon16.png` → `icons/icon16.png`
   - `icon48.png` → `icons/icon48.png`
   - `icon128.png` → `icons/icon128.png`

**Alternative**: Create your own 16x16, 48x48, and 128x128 PNG icons and place them in the `icons/` folder.

### Step 2: Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `QuickDrop` folder
5. Done! The setup page will open automatically

## 🎨 Usage

### Setup Page
On first install, you'll see a setup form where you can enter:
- **Identity**: First name, last name, legal name, email, phone
- **Address**: Address line 1, city, state, ZIP, country
- **Education**: School, degree, field of study, GPA
- **Work Experience**: Job title, company, location, dates, description (add multiple entries)
- **Links**: LinkedIn, GitHub, portfolio, resume

### Extension Popup
Click the extension icon to see all your saved data organized by category. Each block is:
- **Draggable** - Drag onto any form field
- **Clickable** - Click to paste into focused field
- **Copyable** - Click the 📋 icon to copy to clipboard

### Right-Click Menu
Right-click any input field and select "Insert from QuickDrop" to see all available fields.

## 🔧 Technical Details

- **Manifest V3** - Latest Chrome extension standard
- **Local Storage** - All data stored in `chrome.storage.local`
- **Content Scripts** - Injects values into forms with proper event handling
- **Drag & Drop API** - Native HTML5 drag and drop
- **Context Menus** - Right-click integration

## 🛠️ Development

The extension consists of:
- `manifest.json` - Extension configuration
- `setup.html/js/css` - First-time setup page
- `popup.html/js/css` - Extension popup UI
- `content.js` - Form field injection logic
- `background.js` - Context menu and service worker

## 📝 License

MIT License - Feel free to use and modify!

## 🎉 Enjoy!

Fill forms faster. Spend less time typing. Get more done.
