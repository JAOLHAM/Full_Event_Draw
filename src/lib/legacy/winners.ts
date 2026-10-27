/** Participant and prize aggregation from Lucky Draw v1.8.0 — typed without altering its logic. */
export interface Participant {
  id: string; staff_code?: string | null; first_name?: string | null; last_name?: string | null;
  department?: string | null;
}
export interface Prize { id: string; name: string; }
export interface Draw { participant_id: string; prize_id: string; created_at?: string | null; }
export interface WinnerRow {
  id: string; staff_code: string; first_name: string; last_name: string; department: string;
  prizes: string[]; count: number; latest_at: string;
}

export function buildWinnerRows(people: Participant[], prizes: Prize[], draws: Draw[]): WinnerRow[] {
  const peopleById = new Map(people.map(person => [person.id, person]));
  const prizesById = new Map(prizes.map(prize => [prize.id, prize]));
  const grouped = new Map<string, WinnerRow>();

  for (const draw of draws) {
    const person = peopleById.get(draw.participant_id);
    if (!person) continue;
    let row = grouped.get(person.id);
    if (!row) {
      row = {
        id: person.id, staff_code: person.staff_code || '', first_name: person.first_name || '',
        last_name: person.last_name || '', department: person.department || '',
        prizes: [], count: 0, latest_at: ''
      };
      grouped.set(person.id, row);
    }
    row.prizes.push(prizesById.get(draw.prize_id)?.name || '(รางวัลที่ไม่พบข้อมูล)');
    row.count += 1;
    if (!row.latest_at || String(draw.created_at || '') > row.latest_at) {
      row.latest_at = String(draw.created_at || '');
    }
  }
  return [...grouped.values()].sort((a, b) => b.latest_at.localeCompare(a.latest_at));
}

export function csvCell(value: unknown): string {
  let str = String(value ?? '');
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(str)) str = "'" + str;
  return '"' + str.replaceAll('"', '""') + '"';
}

export function winnersCsv(rows: WinnerRow[]): string {
  const data: Array<Array<string | number>> = [
    ['รหัสประจำตัว', 'ชื่อ', 'นามสกุล', 'แผนก', 'ของรางวัลที่ได้รับ', 'จำนวนรางวัล', 'ได้รับล่าสุด'],
    ...rows.map(row => [
      row.staff_code, row.first_name, row.last_name, row.department,
      row.prizes.join(', '), row.count,
      row.latest_at ? new Date(row.latest_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : ''
    ])
  ];
  return '\uFEFF' + data.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
