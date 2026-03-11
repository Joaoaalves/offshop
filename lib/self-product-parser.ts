function detectDelimiter(line: string): string {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  for (const ch of line) if (ch in counts) counts[ch]++;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === delimiter && !inQuote) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line, delimiter);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export function parseJSONOrJSONL(text: string): Record<string, unknown>[] {
  const trimmed = text.trim();

  if (trimmed.startsWith("{")) {
    return trimmed
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
  }

  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) throw new Error("JSON deve ser um array de objetos");
  return parsed;
}
