export type ActivityPeriod = 'all' | 'attention' | 'overdue' | 'today' | 'tomorrow' | 'week';
export interface DatedActivity { status:string; priority:string; dueDate:string|null; }
export const periodLabels:Record<ActivityPeriod,string> = { all:'Todos os prazos', attention:'Pedem atenção', overdue:'Atrasadas', today:'Hoje', tomorrow:'Amanhã', week:'Esta semana' };
export const periodDescriptions:Record<ActivityPeriod,string> = { all:'Sem restrição de prazo.', attention:'Atrasadas, para hoje, de alta prioridade ou em andamento.', overdue:'Atividades abertas com prazo anterior a hoje.', today:'Inclui atividades atrasadas e com prazo para hoje.', tomorrow:'Atividades abertas com prazo para amanhã.', week:'Atividades abertas de hoje até domingo.' };
const localDate = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const activityDate = (value:string|null) => value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';
export function matchesActivityPeriod(item:DatedActivity, period:string, now=new Date()):boolean {
  if (!period || period==='all') return true;
  if (item.status==='done' || item.status==='cancelled') return false;
  const due = activityDate(item.dueDate);
  const today = localDate(now);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1);
  const sunday = new Date(now); sunday.setDate(now.getDate()+(7-now.getDay())%7);
  if (period==='attention') return (!!due && due<=today) || item.priority==='high' || item.status==='doing';
  if (period==='overdue') return !!due && due<today;
  if (period==='today') return !!due && due<=today;
  if (period==='tomorrow') return due===localDate(tomorrow);
  if (period==='week') return !!due && due>=today && due<=localDate(sunday);
  return true;
}
export function sortByActivityUrgency<T extends DatedActivity & {title:string;id:number}>(items:T[]):T[] {
  return [...items].sort((a,b)=>(activityDate(a.dueDate)||'9999').localeCompare(activityDate(b.dueDate)||'9999') || Number(b.priority==='high')-Number(a.priority==='high') || a.title.localeCompare(b.title,'pt-BR') || a.id-b.id);
}
