import { Plugin } from "prosemirror-state";
import { InputRule, inputRules, undoInputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";

export interface AutolinkOptions {
    /**
     * Characters to exclude from the end of detected URLs.
     * @default ['.', ',', '!', '?', ':', ';', ')', ']', '}']
     */
    excludedTrailingChars?: string[];

    /**
     * URL pattern to match. Must start with http:// or https://
     * @default /^https?:\/\//
     */
    urlPattern?: RegExp;

    /**
     * Enable clicking links to open in new tab
     * @default true
     */
    openOnClick?: boolean;

    /**
     * Enable Enter key to trigger auto-linking
     * @default true
     */
    enableEnterTrigger?: boolean;

    /**
     * Enable Backspace to undo auto-link creation
     * @default true
     */
    enableBackspaceUndo?: boolean;
}

/**
 * Helper to identify and sanitize a URL from a candidate string
 * according to v1 specs (stripping specific trailing punctuation).
 */
function findLinkableUrl(
    candidate: string,
    excludedChars: Set<string>,
    urlPattern: RegExp
): { url: string; suffix: string } | null {
    // Strict Protocol check
    if (!urlPattern.test(candidate)) return null;

    let url = candidate;
    let suffix = "";

    while (url.length > 0 && excludedChars.has(url[url.length - 1])) {
        suffix = url[url.length - 1] + suffix;
        url = url.slice(0, -1);
    }

    if (url.length === 0) return null;

    return { url, suffix };
}

/**
 * Creates the space-triggered auto-link input rule
 */
function createSpaceInputRule(
    excludedChars: Set<string>,
    urlPattern: RegExp
): InputRule {
    return new InputRule(/((?:https?:\/\/)[^\s]+)(\s)$/, (state, match, start, end) => {
        const rawUrlCandidate = match[1];
        const triggerChar = match[2];

        const result = findLinkableUrl(rawUrlCandidate, excludedChars, urlPattern);
        if (!result) return null;

        const { url, suffix } = result;
        const schema = state.schema;
        const mark = schema.marks.link.create({ href: url });

        return state.tr.replaceWith(start, end, [
            schema.text(url, [mark]),
            schema.text(suffix + triggerChar)
        ]);
    });
}

/**
 * Main autolink plugin factory
 */
export function autolink(options: AutolinkOptions = {}): Plugin[] {
    const {
        excludedTrailingChars = ['.', ',', '!', '?', ':', ';', ')', ']', '}'],
        urlPattern = /^https?:\/\//i,
        openOnClick = true,
        enableEnterTrigger = true,
        enableBackspaceUndo = true
    } = options;

    const excludedChars = new Set(excludedTrailingChars);
    const plugins: Plugin[] = [];

    // 1. Space trigger input rule
    const spaceRule = createSpaceInputRule(excludedChars, urlPattern);
    plugins.push(inputRules({ rules: [spaceRule] }));

    // 2. Main plugin with handlers
    plugins.push(new Plugin({
        props: {
            handleKeyDown: enableEnterTrigger ? (view, event) => {
                if (event.key === "Enter") {
                    const { state, dispatch } = view;
                    const { $from, empty } = state.selection;
                    if (!empty) return false;

                    const nodeBefore = $from.nodeBefore;
                    if (!nodeBefore || !nodeBefore.isText) return false;

                    const text = nodeBefore.text!;
                    const words = text.split(/\s/);
                    const lastWord = words[words.length - 1];

                    if (!lastWord) return false;

                    const result = findLinkableUrl(lastWord, excludedChars, urlPattern);
                    if (result) {
                        const { url } = result;
                        const start = $from.pos - lastWord.length;
                        const end = $from.pos;

                        const mark = state.schema.marks.link.create({ href: url });

                        const tr = state.tr
                            .removeMark(start, end, state.schema.marks.link)
                            .addMark(start, start + url.length, mark);

                        dispatch(tr);
                        // Return false to allow default Enter behavior (new line)
                        // but ensure the link mark is applied first.
                        return false;
                    }
                }
                return false;
            } : undefined,

            handleClickOn: openOnClick ? (view, pos, _node, _nodePos, _event, _direct) => {
                const mark = view.state.doc.resolve(pos).marks().find(m => m.type.name === "link");
                if (mark && mark.attrs.href) {
                    window.open(mark.attrs.href, '_blank');
                    return true;
                }
                return false;
            } : undefined,

            handlePaste: (view, event, _slice) => {
                const text = event.clipboardData?.getData("text/plain");
                if (!text) return false;

                const trimmedText = text.trim();

                // Validation: Must match URL pattern and have no spaces
                if (!/^https?:\/\/[^\s]+$/.test(trimmedText)) return false;

                const { from, to, empty } = view.state.selection;

                if (!empty) {
                    // Linkify selection
                    const mark = view.state.schema.marks.link.create({ href: trimmedText });
                    const tr = view.state.tr.addMark(from, to, mark);
                    view.dispatch(tr);
                    return true;
                }

                // Insert as link
                const mark = view.state.schema.marks.link.create({ href: trimmedText });
                const tr = view.state.tr.replaceSelectionWith(
                    view.state.schema.text(trimmedText, [mark])
                );
                view.dispatch(tr);
                return true;
            }
        }
    }));

    // 3. Backspace undo keymap
    if (enableBackspaceUndo) {
        plugins.push(keymap({
            "Backspace": undoInputRule
        }));
    }

    return plugins;
}
