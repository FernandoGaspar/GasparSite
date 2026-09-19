import { matchesActivityPeriod, sortByActivityUrgency } from './activityPeriods';
const now = new Date(2026,8,15,10); // Tuesday, local calendar (not UTC).
const item = (dueDate:string|null,status='next',priority='medium') => ({dueDate,status,priority});
describe('Activity periods',()=>{
  it('includes overdue items in today, but not tomorrow or this week',()=>{
    expect(matchesActivityPeriod(item('2026-09-14'),'today',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-14'),'overdue',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-14'),'tomorrow',now)).toBe(false);
    expect(matchesActivityPeriod(item('2026-09-14'),'week',now)).toBe(false);
  });
  it('matches today and tomorrow using calendar dates and ignores closed items',()=>{
    expect(matchesActivityPeriod(item('2026-09-15T12:00:00'),'today',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-16'),'tomorrow',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-15'),'overdue',now)).toBe(false);
    for (const status of ['done','cancelled']) for(const period of ['attention','today','overdue','tomorrow','week'])
      expect(matchesActivityPeriod(item('2026-09-14',status,'high'),period,now)).toBe(false);
  });
  it('ends the week on Sunday and handles month and year boundaries',()=>{
    expect(matchesActivityPeriod(item('2026-09-20'),'week',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-21'),'week',now)).toBe(false);
    expect(matchesActivityPeriod(item('2027-01-01'),'tomorrow',new Date(2026,11,31))).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-21'),'week',new Date(2026,8,20))).toBe(false);
  });
  it('attention includes overdue, today, high priority and doing without treating tomorrow as urgent',()=>{
    for(const value of [item('2026-09-14'),item('2026-09-15'),item(null,'next','high'),item(null,'doing')])
      expect(matchesActivityPeriod(value,'attention',now)).toBe(true);
    expect(matchesActivityPeriod(item('2026-09-16'),'attention',now)).toBe(false);
    expect(matchesActivityPeriod(item(null),'today',now)).toBe(false);
  });
  it('sorts all items by deadline without truncation or mutating the input',()=>{
    const items=Array.from({length:12},(_,id)=>({...item('2026-09-15'),id,title:String(id)}));
    items.unshift({...item('2026-09-14'),id:99,title:'Atrasada'});
    expect(sortByActivityUrgency(items)).toHaveLength(13);
    expect(sortByActivityUrgency(items)[0].id).toBe(99);
    expect(items).toHaveLength(13);
  });
});
