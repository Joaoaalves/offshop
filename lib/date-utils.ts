const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getLast4Months(): Date[] {
  const result: Date[] = [];
  const now = new Date();

  for (let i = 4; i >= 1; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(date);
  }

  return result;
}

export function formatMonthYear(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

export function formatMonthYearFromDate(month: Date) {
  return `${String(month.getMonth() + 1).padStart(2, "0")}/${String(month.getFullYear()).slice(-2)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function monthName(month: number) {
  return months[month - 1];
}
