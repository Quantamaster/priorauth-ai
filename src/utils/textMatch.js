function detectKeyword(text, map) {
  const lower = (text || '').toLowerCase();
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return { key, ...map[key] };
  }
  return null;
}

module.exports = { detectKeyword };
