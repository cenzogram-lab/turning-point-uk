import { useMemo } from "react";

/**
 * MarkdownRenderer — renders Markdown content into formatted HTML using
 * a lightweight regex-based parser.
 *
 * The `marked` library is not in the preinstalled dependency stack, so
 * this component ships a small self-contained parser covering the
 * Markdown subset blog articles use: ATX headings (h1–h4), paragraphs,
 * bold/italic/inline-code, links, unordered/ordered lists, blockquotes,
 * fenced code blocks, and horizontal rules.
 *
 * The output is injected via `dangerouslySetInnerHTML`. The parser
 * HTML-escapes all literal text and code spans/blocks BEFORE applying
 * inline markdown, so user-supplied Markdown cannot inject markup. The
 * only constructed tags come from the parser's own replacements.
 *
 * Apply the `.markdown-content` CSS class (defined in index.css) for
 * theme styling: bright white headings, soft blue-tinted grey body text,
 * red accent links, mono code, blockquote rule.
 *
 * Usage:
 *   <MarkdownRenderer content={post.content} />
 */

export interface MarkdownRendererProps {
  /** Raw Markdown source to render. */
  content: string;
  /** Optional className to compose with `.markdown-content`. */
  className?: string;
}

/** HTML-escape a string so injected Markdown cannot introduce markup. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Apply inline markdown (bold, italic, inline code, links) to a single
 * line of already-escaped text. Inline code is processed first so its
 * contents are not re-interpreted as bold/italic/link syntax.
 */
function renderInline(escaped: string): string {
  let out = escaped;

  // Inline code: `code` — protect contents from further inline parsing.
  // Use a private-use sentinel char (U+E000) that won't appear in normal text
  // and isn't a control character, so it passes lint and survives inline passes.
  const SENTINEL = "\uE000";
  const codeStash: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_m, code: string) => {
    codeStash.push(`<code>${code}</code>`);
    return `${SENTINEL}${codeStash.length - 1}${SENTINEL}`;
  });

  // Links: [text](href) — href is escaped and limited to http(s)/mailto/relative.
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text: string, href: string) => {
      const safeHref = sanitizeHref(href);
      if (!safeHref) return text;
      return `<a href="${safeHref}" rel="noopener noreferrer">${text}</a>`;
    },
  );

  // Bold: **text** or __text__
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_ (avoid matching inside words with underscores)
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>");
  out = out.replace(/(^|[^_\w])_([^_]+)_/g, "$1<em>$2</em>");

  // Restore stashed inline code. The sentinel is a private-use char (U+E000),
  // escaped here as \uE000 to avoid embedding a literal private-use glyph.
  out = out.replace(
    /\uE000(\d+)\uE000/g,
    (_m, i: string) => codeStash[Number(i)] ?? "",
  );

  return out;
}

/** Allow http(s), mailto, and relative URLs; reject everything else. */
function sanitizeHref(href: string): string {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return "";
}

/**
 * Parse a Markdown source string into an HTML string. Block-level
 * constructs are processed line-by-line with a small state machine for
 * lists and code fences. All literal text is HTML-escaped before any
 * inline markdown is applied.
 */
function parseMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  let listType: "ul" | "ol" | null = null;
  let inCode = false;
  let codeBuffer: string[] = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block: ``` ... ```
    if (/^```/.test(line)) {
      if (inCode) {
        html.push(
          `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`,
        );
        codeBuffer = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    // Horizontal rule: --- or *** or ___ (3+ chars, optional spaces)
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      closeList();
      html.push("<hr />");
      i++;
      continue;
    }

    // ATX headings: # .. ######
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      const level = Math.min(headingMatch[1].length, 4);
      const text = renderInline(escapeHtml(headingMatch[2].trim()));
      html.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote: > text
    if (/^>\s?/.test(line)) {
      closeList();
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const text = renderInline(escapeHtml(quoteLines.join(" ").trim()));
      html.push(`<blockquote>${text}</blockquote>`);
      continue;
    }

    // Unordered list: - / * / + item
    if (/^\s*[-*+]\s+/.test(line)) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      const text = renderInline(
        escapeHtml(line.replace(/^\s*[-*+]\s+/, "").trim()),
      );
      html.push(`<li>${text}</li>`);
      i++;
      continue;
    }

    // Ordered list: 1. item
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      const text = renderInline(
        escapeHtml(line.replace(/^\s*\d+\.\s+/, "").trim()),
      );
      html.push(`<li>${text}</li>`);
      i++;
      continue;
    }

    // Blank line — paragraph break.
    if (line.trim() === "") {
      closeList();
      i++;
      continue;
    }

    // Paragraph: gather consecutive non-blank, non-block lines.
    closeList();
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    const text = renderInline(escapeHtml(paraLines.join(" ")));
    html.push(`<p>${text}</p>`);
  }

  // Flush any open blocks.
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
  }
  closeList();

  return html.join("\n");
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content ?? ""), [content]);
  const composed = className
    ? `markdown-content ${className}`
    : "markdown-content";
  return (
    <div
      className={composed}
      // Content is HTML-escaped before any markdown is applied, so user
      // Markdown cannot inject markup. The only constructed tags come from
      // the parser's own replacements.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: parser escapes all literal text before applying markdown
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
