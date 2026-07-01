/**
 * Sanitizes and renders basic markdown strings to beautiful styled HTML blocks
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";
  
  // Basic HTML escape (except brackets we might want)
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic (*text*)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Unordered list items (- item)
  html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='list-disc list-inside ml-4 my-1 text-slate-700 dark:text-slate-300'>$1</li>");

  // Headers (### Header)
  html = html.replace(/^### (.*?)$/gm, "<h4 class='text-base font-bold mt-4 mb-2 text-slate-900 dark:text-white'>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3 class='text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-1'>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2 class='text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2'>$1</h2>");

  // Code blocks (```lang ... ```)
  html = html.replace(/```(javascript|typescript|json|css|html)?([\s\S]*?)```/gm, "<pre class='bg-slate-50 dark:bg-slate-900 p-4 rounded-xl my-4 font-mono text-[11px] overflow-auto border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200'><code>$2</code></pre>");

  // Inline code (`code`)
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-500'>$1</code>");

  // Paragraph blocks (separated by double newlines)
  html = html.split(/\n\n+/).map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith("<h") || trimmed.startsWith("<pre") || trimmed.startsWith("<li")) {
      return p;
    }
    return `<p class="my-3 leading-relaxed text-slate-700 dark:text-slate-300 text-xs md:text-sm">${p}</p>`;
  }).join("\n");

  return html;
}
