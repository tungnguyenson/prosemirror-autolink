# Auto-Link Handling — v1 Specification & Test Cases

This document defines the behavior, scope, and test cases for automatic link handling
in a ProseMirror-based editor with no edit/view mode separation.

---

## 1. Scope & Principles

- The editor automatically converts valid URLs into links.
- Links are created only when user intent is clear (space, enter, paste).
- Auto-linking must never interfere with numeric parsing (e.g. `500k`).
- Link creation is reversible via Undo.
- Clicking a link always opens it (no editor/view mode separation).

---

## 2. URL Definition

### 2.1 Accepted URL Formats

A string is considered a valid URL if and only if:

- It starts with:
  - `http://`
  - `https://`
- Followed by a valid hostname OR IP address
- Optional path, query string, and hash are allowed

**Valid examples:**
- `https://example.com`
- `http://example.com/path?x=1#hash`
- `https://192.168.1.1`
- `http://10.0.0.1/admin`

**Invalid examples:**
- `www.example.com`
- `example.com`
- `ftp://example.com`
- `mailto:test@example.com`

---

## 3. Auto-Link Creation

### 3.1 Trigger Conditions

Auto-linking is triggered only by:
- Typing a space character ` `
- Pressing `Enter`
- Pasting content

Auto-linking MUST NOT run on every transaction.

---

### 3.2 Typing-Based Auto-Linking

When a valid URL is immediately followed by a trigger character:
- The URL text is converted into a link mark
- The trigger character is preserved
- The cursor remains after the trigger character

#### URL Boundary Rules

Trailing punctuation MUST be excluded from the link.

Excluded characters:
`.` `,` `!` `?` `:` `;` `)` `]` `}`

**Example:**
```
(https://example.com),
```

**Result:**
- Link: `https://example.com`
- Outside text: `(` and `),`

---

## 4. Undo Behavior

- Auto-link creation is a **single undoable action**
- Undo removes the link mark only
- Text content remains unchanged

**Example:**
```
Type: https://example.com␣
→ Auto-link created

Undo
→ https://example.com
```

---

## 5. Paste Handling

### 5.1 Paste Without Selection

- A pasted valid URL is inserted as a link
- Leading and trailing whitespace is trimmed

**Example:**
```
Paste: "  https://example.com  "
→ https://example.com (linked)
```

---

### 5.2 Paste With Selection (Linkify Selection)

- Selected text becomes a link
- The pasted URL is used as the link target
- Selected text content is preserved

**Example:**
```
Text: "Check this out"
Select: "this"
Paste: https://example.com

Result:
"this" → link to https://example.com
```

---

### 5.3 Paste Mixed Content

**Example:**
```
Paste: Check this https://example.com now
```

**Behavior:**
- Only the URL portion is linked
- Remaining text stays plain text

---

### 5.4 Paste Over Existing Link

- Existing link text and href are both replaced
- Result is equivalent to inserting a fresh link

---

## 6. Click & Interaction Behavior

- Clicking a link ALWAYS opens it in a new browser tab
- Cursor placement inside links is done via keyboard navigation

### Visual Styling
- Color: `#2563eb`
- Underline decoration
- Pointer cursor on hover

---

## 7. Explicit Non-Link Rules

The following patterns MUST NEVER auto-link:

### Numeric & Unit Patterns
- `500k`
- `1tr`
- `1.5m`

### Version Numbers
- `1.2.3`
- `2.10.4`

### Local / Development Addresses
- `localhost`
- `localhost:3000`
- `127.0.0.1`
- `http://localhost`
- `http://localhost:3000`

---

## 8. Performance & Limits

- Maximum auto-linkable URL length is capped (implementation-defined)
- Auto-link logic runs ONLY on:
  - Space
  - Enter
  - Paste

---

## 9. Non-Goals

- Protocol-less URL auto-linking
- Email or phone auto-linking
- Markdown-style link syntax
- Auto-linking during IME composition
- Rich link editing UI (popover, toolbar)

