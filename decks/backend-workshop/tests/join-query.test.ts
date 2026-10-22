import { describe, expect, it } from 'vitest';
import demo from '../sources/join-demo.json';
import { joinedRows, resultRows, resultColumns } from '../src/join-query';

describe('JOIN teaching data', () => {
  it('preserves enrollment order and matches each foreign key before filtering', () => {
    expect(resultRows(demo, 0).map(row=>row.member_id)).toEqual([3,2,1]);
    expect(resultColumns(0)).toEqual(['member_id','course_id','status']);
    expect(joinedRows(demo,1).map(row=>[row.member_id,row.name])).toEqual([[3,'陳怡君'],[2,'李小華'],[1,'王小明']]);
    expect(joinedRows(demo,2).map(row=>[row.course_id,row.title,row.capacity])).toEqual([
      [1,'Backend Workshop',30],[2,'Database Training',25],[1,'Backend Workshop',30],
    ]);
  });
  it('filters by the bound course parameter, projects four fields, then sorts by member id', () => {
    expect(resultRows(demo,3).map(row=>row.member_id)).toEqual([3,1]);
    expect(resultRows({...demo,parameter:2},3).map(row=>row.member_id)).toEqual([2]);
    expect(resultRows({...demo,parameter:99},3)).toEqual([]);
    expect(resultColumns(4)).toEqual(['name','title','capacity','status']);
    expect(resultRows(demo,5).map(row=>[row.member_id,row.name,row.capacity,row.status])).toEqual([
      [1,'王小明',30,'enrolled'],[3,'陳怡君',30,'enrolled'],
    ]);
    expect(resultRows({...demo,enrollments:[]},5)).toEqual([]);
  });
  it('uses INNER JOIN semantics for missing matches', () => {
    expect(joinedRows({...demo,members:demo.members.filter(row=>row.id!==2)},1).map(row=>row.member_id)).toEqual([3,1]);
    expect(joinedRows({...demo,courses:demo.courses.filter(row=>row.id!==1)},2).map(row=>row.member_id)).toEqual([2]);
  });
});
