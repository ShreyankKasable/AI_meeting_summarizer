export function extractShareToken(value) {
    const input = String(value || "").trim();
    if (!input) return "";

    const sharePathMatch = input.match(/\/share\/([^/?#\s]+)/i);
    if (sharePathMatch?.[1]) return decodeURIComponent(sharePathMatch[1]);

    return input.replace(/^["']|["']$/g, "");
}
