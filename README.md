# prosemirror-autolink

A ProseMirror plugin that automatically detects and converts URLs into links as you type, paste, or interact with text.

## Features

- **Auto-linking on Space**: Automatically converts URLs to links when you type a space after them.
- **Enter key trigger**: Converts URLs to links when pressing Enter (configurable).
- **Smart Punctuation Handling**: Automatically excludes trailing punctuation (e.g., `.` `,` `)`) from the link.
- **Paste Handling**: Automatically detects if you are pasting a URL and either linkifies the current selection or inserts a link.
- **Click to Open**: Option to open links in a new tab when clicked.
- **Undo Support**: Backspace can undo the auto-link creation.

## Installation

```bash
npm install prosemirror-autolink
# or
pnpm add prosemirror-autolink
```

## Usage

Add the plugin to your ProseMirror state:

```typescript
import { autolink } from "prosemirror-autolink";
import { schema } from "./your-schema"; // Ensure your schema has a 'link' mark

const state = EditorState.create({
    schema,
    plugins: [
        ...autolink({
            openOnClick: true,
            enableEnterTrigger: true,
            excludedTrailingChars: ['.', ',', '!', '?', ':', ';', ')', ']', '}']
        })
        // ... other plugins
    ]
});
```

## Options

| Option | Type | Default | Description |
|Prefix|Type|Default|Description|
|---|---|---|---|
| `excludedTrailingChars` | `string[]` | `['.', ',', ...]` | Characters to exclude from the end of a detected URL. |
| `urlPattern` | `RegExp` | `/^https?:\/\//i` | Regex to validate URLs. Must start with `http://` or `https://`. |
| `openOnClick` | `boolean` | `true` | Whether clicking a link node opens it in a new tab. |
| `enableEnterTrigger` | `boolean` | `true` | Whether pressing Enter after a URL should auto-link it. |
| `enableBackspaceUndo` | `boolean` | `true` | Whether Backspace immediately after auto-linking undoes the link. |

## Requirements

## Attribution

This package is built on top of [ProseMirror](https://github.com/prosemirror), a robust toolkit for building rich-text editors on the web.
