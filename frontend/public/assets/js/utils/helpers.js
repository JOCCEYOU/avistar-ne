/**
 * Escapes unsafe HTML characters to prevent Cross-Site Scripting (XSS) attacks.
 * @param {string} unsafe - The raw user-supplied string.
 * @returns {string} The HTML-escaped string.
 */
export function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
