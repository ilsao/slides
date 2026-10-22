import sample from '../sources/join-demo.json';

export type JoinDemo = typeof sample;
export type JoinColumn = 'member_id' | 'course_id' | 'name' | 'title' | 'capacity' | 'status';
export type JoinRow = {
  key: string; member_id: number; course_id: number; status: string;
  name?: string; title?: string; capacity?: number;
};
export const joinColumns: JoinColumn[] = ['member_id', 'course_id', 'name', 'title', 'capacity', 'status'];
export const selectedColumns: JoinColumn[] = ['name', 'title', 'capacity', 'status'];
export function resultColumns(step: number): JoinColumn[] {
  if (step >= 4) return selectedColumns;
  return joinColumns.filter(key => {
    if (key === 'name') return step >= 1;
    if (key === 'title' || key === 'capacity') return step >= 2;
    return true;
  });
}

// The teaching stages follow logical data operations, not SQL text line order.
export function joinedRows(demo: JoinDemo, step: number): JoinRow[] {
  return demo.enrollments.flatMap(enrollment => {
    const member = demo.members.find(row => row.id === enrollment.member_id);
    const course = demo.courses.find(row => row.id === enrollment.course_id);
    if ((step >= 1 && !member) || (step >= 2 && !course)) return [];
    return [{ ...enrollment, key: `${enrollment.member_id}-${enrollment.course_id}`,
      ...(step >= 1 ? { name: member!.name } : {}),
      ...(step >= 2 ? { title: course!.title, capacity: course!.capacity } : {}),
    }];
  });
}
export function resultRows(demo: JoinDemo, step: number): JoinRow[] {
  const rows = joinedRows(demo, step).filter(row => step < 3 || row.course_id === demo.parameter);
  return step >= 5 ? rows.sort((a, b) => a.member_id - b.member_id) : rows;
}
