# Test Cases

## Typing

| ID | Description | Steps | Expected |
|----|------------|-------|----------|
| T1 | Basic auto-link | Type `https://example.com` + space | URL is linked |
| T2 | Enter trigger | Type URL + Enter | URL linked, newline added |
| T3 | Query params | Type URL + space | Full URL linked |
| T4 | Protocol-less | Type `google.com` + space | No link |
| T5 | Punctuation | Type `(https://a.com),` | Link excludes punctuation |

---

## Undo

| ID | Description | Expected |
|----|------------|----------|
| U1 | Undo auto-link | Link removed, text preserved |
| U2 | Redo auto-link | Link restored |

---

## Paste

| ID | Description | Expected |
|----|------------|----------|
| P1 | Paste URL | Insert as link |
| P2 | Paste with whitespace | Trim + link |
| P3 | Paste over selection | Selection becomes link |
| P4 | Paste mixed text | Only URL linked |
| P5 | Paste over link | Replace link text + href |

---
