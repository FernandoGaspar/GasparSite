import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  MdCancel, MdCheckCircle, MdEdit, MdInbox, MdOpenInNew, MdPause, MdPerson,
  MdPlayArrow, MdRefresh, MdSchedule, MdSend,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { idempotencyConfig } from '../../utils/idempotency';
import { Card } from './styles';

type Channel = { type?: string; address?: string; maskedAddress?: string; label?: string; isPrimary?: boolean; isAllowed?: boolean; agentAllowed?: boolean };
export type SchedulingContact = {
  id?: string | number;
  contactId?: string | number;
  displayName?: string;
  name?: string;
  title?: string;
  confidence?: number;
  reason?: string;
  channels?: Channel[];
  address?: string;
  label?: string;
  channelType?: string;
  whatsapp?: string;
  phone?: string;
  isAllowed?: boolean;
  agentAllowed?: boolean;
};
type SchedulingEvent = {
  id?: string | number;
  type?: string;
  title?: string;
  message?: string;
  text?: string;
  content?: string;
  occurredAt?: string;
  createdAt?: string;
  timestamp?: string;
  direction?: string;
};
type Constraints = {
  timezone?: string;
  durationMinutes?: number;
  earliestAt?: string;
  latestAt?: string;
  allowedWeekdays?: number[];
  allowedStartTime?: string;
  allowedEndTime?: string;
  locations?: string[];
  maxRounds?: number;
  notes?: string;
  [key: string]: unknown;
};
export type SchedulingAction = {
  type?: string;
  id?: string | number;
  actionId?: string | number;
  state?: string;
  status?: string;
  version?: number;
  contactCandidates?: SchedulingContact[];
  contact?: SchedulingContact;
  contactId?: string | number;
  request?: string;
  constraints?: Constraints;
  draftMessage?: string | { text?: string; body?: string };
  mode?: 'negotiate_only' | 'negotiate_and_book' | string;
  expiresAt?: string;
  events?: SchedulingEvent[];
  messages?: SchedulingEvent[];
  agreedAppointment?: Record<string, unknown>;
  proposedSlot?: Record<string, unknown>;
  summary?: string;
  pauseReason?: string;
  calendarStatus?: string;
  chatId?: string;
  conversationId?: string;
  whatsappUrl?: string;
  [key: string]: unknown;
};

type Props = { action: SchedulingAction; onChange?: (action: SchedulingAction) => void };

const stateLabels: Record<string, string> = {
  needs_contact: 'Escolha o contato',
  awaiting_initial_approval: 'Aguardando sua aprovação',
  initial_message_queued: 'Mensagem na fila',
  negotiating: 'Negociação em andamento',
  awaiting_final_approval: 'Aguardando aprovação final',
  final_message_queued: 'Confirmação na fila',
  intervention_message_queued: 'Orientação na fila',
  paused: 'Pausado',
  confirmed: 'Compromisso confirmado',
  declined: 'Não foi possível combinar',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  failed: 'Falhou',
};
const eventLabels: Record<string, string> = {
  created: 'Pedido de agendamento criado',
  initial_approved: 'Início aprovado por você',
  initial_message_sent: 'Mensagem inicial enviada',
  negotiation_reply_queued: 'Resposta preparada para envio',
  final_proposal_ready: 'Proposta final recebida',
  final_approved: 'Proposta final aprovada por você',
  user_intervened: 'Intervenção humana registrada',
  paused: 'Negociação pausada por você',
  resumed: 'Negociação retomada',
  cancelled: 'Negociação cancelada',
  contact_declined: 'O contato recusou o agendamento',
  mandate_boundary_reached: 'A proposta ultrapassou os limites aprovados',
  round_limit_reached: 'O limite de rodadas foi atingido',
  policy_paused: 'A negociação precisa da sua revisão',
  identity_questioned: 'O contato pediu esclarecimentos; a negociação foi pausada',
  outbound_attention_acknowledged: 'Atenção de envio conferida por você',
  scheduling_confirmed: 'Compromisso confirmado',
  expired: 'A autorização expirou',
};
const pauseLabels: Record<string, string> = {
  paused_by_user: 'Pausado por você.',
  identity_questioned: 'O contato pediu esclarecimentos.',
  proposal_outside_mandate: 'A proposta ficou fora dos limites aprovados.',
  round_limit_reached: 'O limite de rodadas foi atingido.',
  unsafe_or_missing_reply: 'A resposta precisa de revisão humana.',
  message_needs_user_review: 'A próxima mensagem precisa da sua revisão.',
  outbound_outcome_unknown: 'Não foi possível confirmar o resultado do último envio.',
  outbound_sent_after_state_changed: 'O envio terminou depois de o agendamento mudar de estado.',
  outbound_failed: 'O último envio falhou.',
  outbound_rejected: 'O WhatsApp rejeitou o último envio.',
};
const outboundPauseReasons=new Set(['outbound_outcome_unknown','outbound_sent_after_state_changed','outbound_failed','outbound_rejected']);
const unrecoverableOutboundPauseReasons=new Set(['outbound_outcome_unknown','outbound_sent_after_state_changed']);
const calendarLabels: Record<string, string> = {
  pending: 'reserva no calendário pendente',
  created: 'reservado no calendário',
  confirmed: 'reservado no calendário',
  failed: 'reserva no calendário pendente de correção',
  not_requested: 'sem reserva automática no calendário',
};
const terminalStates = new Set(['confirmed', 'declined', 'cancelled', 'expired', 'failed']);
const pollingStates = new Set([
  'needs_contact', 'awaiting_initial_approval', 'initial_message_queued', 'negotiating',
  'awaiting_final_approval', 'final_message_queued', 'intervention_message_queued',
]);
const weekdays: Array<[number, string]> = [
  [1, 'Seg'], [2, 'Ter'], [3, 'Qua'], [4, 'Qui'], [5, 'Sex'], [6, 'Sáb'], [7, 'Dom'],
];

const messageOf = (error: any, fallback: string) => error?.response?.data?.message || fallback;
const unwrap = (data: any): SchedulingAction => data?.scheduling || data?.action || data?.item || data?.pendingAction || data || {};
const actionIdOf = (item: SchedulingAction) => String(item.id || item.actionId || '');
const stateOf = (item: SchedulingAction) => String(item.state || item.status || 'awaiting_initial_approval');
const draftOf = (item: SchedulingAction) => typeof item.draftMessage === 'string'
  ? item.draftMessage
  : item.draftMessage?.text || item.draftMessage?.body || '';
const contactIdOf = (contact?: SchedulingContact) => String(contact?.id || contact?.contactId || '');
const contactName = (contact?: SchedulingContact) => contact?.displayName || contact?.name || contact?.title || 'Contato';
const contactAddress = (contact?: SchedulingContact) => {
  const channel = contact?.channels?.find(value => value.type === 'whatsapp') || contact?.channels?.[0];
  return channel?.address || channel?.maskedAddress || contact?.address || contact?.whatsapp || contact?.phone || '';
};
const contactIsAuthorized = (contact?: SchedulingContact) => {
  if (!contact) return false;
  const channel = contact.channels?.find(value => value.type === 'whatsapp' && value.isPrimary)
    || contact.channels?.find(value => value.type === 'whatsapp') || contact.channels?.[0];
  return channel ? channel.isAllowed === true && channel.agentAllowed === true : contact.isAllowed === true && contact.agentAllowed === true;
};
const maskAddress = (value: string) => {
  if (!value) return 'Canal não informado';
  if (value.includes('*')) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return value;
  return `${digits.slice(0, 2)} ••••• ${digits.slice(-4)}`;
};
const isoToLocalInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const localInputToIso = (value: string) => value ? new Date(value).toISOString() : '';
const asDate = (value: unknown) => {
  if (!value || typeof value !== 'string') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};
const eventText = (event: SchedulingEvent) => event.message || event.text || event.content || event.title || eventLabels[event.type || ''] || 'Atualização da negociação';
const eventDate = (event: SchedulingEvent) => event.occurredAt || event.createdAt || event.timestamp;
const stateTone = (state: string) => state === 'confirmed' ? 'success' : ['failed', 'cancelled', 'declined', 'expired'].includes(state) ? 'danger' : ['paused', 'awaiting_final_approval'].includes(state) ? 'warning' : '';
const appointmentValue = (appointment: Record<string, unknown>, ...keys: string[]) => {
  const key = keys.find(candidate => appointment[candidate]);
  return key ? appointment[key] : undefined;
};

export const isWhatsAppScheduling = (value?: Record<string, unknown>): value is SchedulingAction => (
  value?.type === 'whatsapp_scheduling'
);

export default function SchedulingCard({ action, onChange }: Props) {
  const [item, setItem] = useState<SchedulingAction>(action);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [editingConstraints, setEditingConstraints] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const [intervention, setIntervention] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [mode, setMode] = useState('negotiate_only');
  const [constraints, setConstraints] = useState<Constraints>({});
  const [deliveryReviewed,setDeliveryReviewed]=useState(false);
  const itemRef = useRef(item);
  const formRevisionRef = useRef('');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const commit = useCallback((next: SchedulingAction) => {
    itemRef.current = next;
    setItem(next);
    onChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    itemRef.current = action;
    setItem(action);
  }, [action]);

  useEffect(() => {
    const revision = `${action.id || action.actionId || ''}:${action.version ?? ''}`;
    if (formRevisionRef.current === revision) return;
    formRevisionRef.current = revision;
    const selected = action.contactId || action.contact?.id || action.contact?.contactId
      || action.contactCandidates?.find(candidate => (candidate as any).selected)?.id;
    setSelectedContactId(selected ? String(selected) : '');
    setDraftMessage(draftOf(action));
    setMode(action.mode || 'negotiate_only');
    setConstraints(action.constraints || {});
    setDeliveryReviewed(false);
  }, [action]);

  const id = actionIdOf(item);
  const state = stateOf(item);
  const refresh = useCallback(async (silent = false) => {
    const currentId = actionIdOf(itemRef.current);
    if (!currentId) return;
    if (!silent) setBusy('refresh');
    try {
      const { data } = await axios.get(`${URL_API}/secretary/scheduling/${encodeURIComponent(currentId)}`);
      const next = { ...itemRef.current, ...unwrap(data), type: 'whatsapp_scheduling' };
      commit(next);
      setError('');
    } catch (cause) {
      if (!silent) setError(messageOf(cause, 'Não foi possível atualizar este acompanhamento.'));
    } finally {
      if (!silent) setBusy('');
    }
  }, [commit]);

  useEffect(() => { void refresh(true); }, [id, refresh]);
  useEffect(() => {
    if (!id || !pollingStates.has(state)) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh(true);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [id, refresh, state]);

  const mutate = async (operation: string, payload: Record<string, unknown> = {}) => {
    const current = itemRef.current;
    const currentId = actionIdOf(current);
    if (!currentId || busy) return;
    setBusy(operation);
    setError('');
    try {
      const { data } = await axios.post(
        `${URL_API}/secretary/scheduling/${encodeURIComponent(currentId)}/${operation}`,
        { expectedVersion: current.version, ...payload },
        idempotencyConfig(`secretary-${operation}`),
      );
      const next = { ...current, ...unwrap(data), type: 'whatsapp_scheduling' };
      commit(next);
      setEditingConstraints(false);
      setShowIntervention(false);
      setIntervention('');
    } catch (cause: any) {
      if (cause?.response?.status === 409) {
        setError(messageOf(cause, 'Este agendamento mudou. Atualizamos os dados para você revisar novamente.'));
        await refresh(true);
      } else {
        setError(messageOf(cause, 'Não foi possível concluir esta ação. Tente novamente.'));
      }
    } finally { setBusy(''); }
  };

  const candidates = item.contactCandidates || [];
  const selectedContact = candidates.find(candidate => contactIdOf(candidate) === selectedContactId) || item.contact;
  const selectedAddress = contactAddress(selectedContact);
  const selectedContactAuthorized = contactIsAuthorized(selectedContact);
  const phoneDigits = selectedAddress.replace(/\D/g, '');
  const events = useMemo(() => [...(item.events || []), ...(item.messages || [])]
    .sort((left, right) => String(eventDate(left) || '').localeCompare(String(eventDate(right) || ''))), [item.events, item.messages]);
  const canApproveInitial = ['needs_contact', 'awaiting_initial_approval'].includes(state);
  const canApproveFinal = state === 'awaiting_final_approval';
  const canPause = ['initial_message_queued', 'negotiating', 'final_message_queued', 'intervention_message_queued'].includes(state);
  const outboundPauseReason=outboundPauseReasons.has(String(item.pauseReason||''));
  const unrecoverableOutboundPause=unrecoverableOutboundPauseReasons.has(String(item.pauseReason||''));
  const outcomeUnknown=item.pauseReason==='outbound_outcome_unknown'||item.pauseReason==='outbound_sent_after_state_changed';
  const lateSendAfterStateChange=item.pauseReason==='outbound_sent_after_state_changed';
  const terminal=terminalStates.has(state);
  const canAcknowledgeAttention=terminal&&unrecoverableOutboundPause;
  const canResume = state === 'paused'&&!unrecoverableOutboundPause;
  const canIntervene = ['initial_message_queued', 'negotiating', 'awaiting_final_approval', 'paused'].includes(state)&&!outboundPauseReason;
  const canCancel = !terminalStates.has(state);
  const internalChatId = item.chatId || item.conversationId || (selectedContact as any)?.chatId;
  const conversationUrl = `/communications?channel=whatsapp${internalChatId ? `&chatId=${encodeURIComponent(String(internalChatId))}` : ''}`;
  const inboxUrl = `/communications?channel=whatsapp&section=scheduling&schedulingId=${encodeURIComponent(id)}`;
  const appointment = item.agreedAppointment || item.proposedSlot;
  const updateConstraint = (key: keyof Constraints, value: unknown) => setConstraints(current => ({ ...current, [key]: value }));
  const toggleWeekday = (weekday: number) => setConstraints(current => {
    const selected = current.allowedWeekdays || [];
    return { ...current, allowedWeekdays: selected.includes(weekday) ? selected.filter(value => value !== weekday) : [...selected, weekday] };
  });
  const approveInitial = () => void mutate('approve-initial', {
    contactId: selectedContactId || undefined,
    message: draftMessage,
    constraints,
    mode,
  });

  const summary = [
    constraints.durationMinutes ? `${constraints.durationMinutes} min` : '',
    constraints.earliestAt ? `de ${asDate(constraints.earliestAt)}` : '',
    constraints.latestAt ? `até ${asDate(constraints.latestAt)}` : '',
    constraints.allowedStartTime || constraints.allowedEndTime ? `${constraints.allowedStartTime || '—'}–${constraints.allowedEndTime || '—'}` : '',
    constraints.maxRounds ? `até ${constraints.maxRounds} rodadas` : '',
  ].filter(Boolean);

  return <Card aria-label="Acompanhamento de agendamento pelo WhatsApp" aria-busy={!!busy}>
    <div className="schedule-heading">
      <div><span className="schedule-kicker"><MdSchedule /> Secretária · WhatsApp</span><h3>{item.summary || item.request || 'Combinar um compromisso'}</h3></div>
      <span className={`schedule-state ${stateTone(state)}`} role="status" aria-live="polite">{stateLabels[state] || state.replace(/_/g, ' ')}</span>
    </div>

    {error && <div className="schedule-error" role="alert">{error}</div>}
    {outboundPauseReason?<div className="delivery-outcome-alert" role="alert"><strong>{outcomeUnknown?'O envio pode já ter acontecido.':pauseLabels[String(item.pauseReason)]}</strong><p>{lateSendAfterStateChange&&terminal?'O envio terminou depois de este mandato ter sido encerrado. Não reenvie: confira a conversa antes de iniciar um novo mandato.':outcomeUnknown&&terminal?'Este mandato já está encerrado, mas o resultado do último envio não foi confirmado. Não reenvie: confira a conversa antes de iniciar outro.':outcomeUnknown?'A confirmação se perdeu depois da tentativa. Não reenvie: confira a conversa para evitar uma mensagem duplicada e encerre este mandato antes de iniciar outro.':item.pauseReason==='outbound_rejected'?'O canal recusou a mensagem. Confira a conversa e as permissões antes de voltar para a revisão.':'Confira a conversa e a conexão antes de voltar para a revisão; nenhuma mensagem será reenviada por este botão.'}</p><a href={conversationUrl}><MdOpenInNew/> Conferir conversa com segurança</a>{(!terminal||canAcknowledgeAttention)&&<label><input type="checkbox" checked={deliveryReviewed} onChange={event=>setDeliveryReviewed(event.target.checked)}/><span>{canAcknowledgeAttention?'Conferi a conversa e estou ciente desta mensagem possivelmente enviada.':unrecoverableOutboundPause?'Conferi a conversa e entendo que este mandato deve ser encerrado.':'Conferi a conversa e quero voltar para a etapa de revisão.'}</span></label>}</div>:state === 'paused'?<div className="schedule-note"><strong>Atenção necessária.</strong> {pauseLabels[String(item.pauseReason || '')] || 'Revise o acompanhamento antes de retomar.'}</div>:null}
    {item.request && item.summary && <p className="schedule-request">{item.request}</p>}

    {(canApproveInitial || candidates.length > 0 || item.contact) && <section className="schedule-section">
      <header><h4><MdPerson /> Contato</h4>{busy === 'refresh' ? <span className="expiry">Atualizando…</span> : <button type="button" className="small-action" onClick={() => void refresh()}><MdRefresh /> Atualizar</button>}</header>
      {candidates.length > 0 ? <div className="candidate-list">{candidates.map(candidate => {
        const candidateId = contactIdOf(candidate);
        return <label className={`candidate ${candidateId === selectedContactId ? 'selected' : ''}`} key={candidateId || contactName(candidate)}>
          <input type="radio" name={`schedule-contact-${id}`} value={candidateId} checked={candidateId === selectedContactId} disabled={!canApproveInitial || !!busy} onChange={() => setSelectedContactId(candidateId)} />
          <span><strong>{contactName(candidate)}</strong><small>{maskAddress(contactAddress(candidate))}{typeof candidate.confidence === 'number' ? ` · ${Math.round(candidate.confidence * 100)}% de correspondência` : ''}{candidate.reason ? ` · ${candidate.reason}` : ''} · {contactIsAuthorized(candidate) ? 'Secretária autorizada' : 'Sem autorização para a secretária'}</small></span>
        </label>;
      })}</div> : item.contact ? <div className="candidate selected"><MdCheckCircle /><span><strong>{contactName(item.contact)}</strong><small>{maskAddress(contactAddress(item.contact))}</small></span></div> : <p className="schedule-note">Nenhum contato foi confirmado. Escolha uma sugestão acima ou cadastre o contato na Central de Comunicação.</p>}
    </section>}

    {canApproveInitial && <section className="schedule-section">
        <h4>Mensagem inicial</h4>
        <textarea className="draft-preview" aria-label="Mensagem inicial para o contato" value={draftMessage} disabled={!!busy} onChange={event => setDraftMessage(event.target.value)} />
        <p className="schedule-copy">Revise exatamente o que será enviado. Nada começa antes da sua aprovação.</p>
        {!selectedContactAuthorized && <p className="schedule-note"><strong>Autorização necessária.</strong> Ative o canal e permita a negociação para este contato na Central de Comunicação.</p>}
      </section>}
    <section className="schedule-section">
        <header><h4>Limites da negociação</h4>{(canApproveInitial || canIntervene) && <button type="button" className="small-action" onClick={() => setEditingConstraints(current => !current)}><MdEdit /> {editingConstraints ? 'Concluir edição' : 'Editar limites'}</button>}</header>
        {!editingConstraints && <div className="constraint-summary">{summary.length ? summary.map(value => <span key={value}>{value}</span>) : <span>Sem limites adicionais informados</span>}</div>}
        {editingConstraints && <div className="constraint-grid">
          <label className="field">Início permitido<input type="datetime-local" value={isoToLocalInput(constraints.earliestAt)} onChange={event => updateConstraint('earliestAt', localInputToIso(event.target.value))} /></label>
          <label className="field">Prazo final<input type="datetime-local" value={isoToLocalInput(constraints.latestAt)} onChange={event => updateConstraint('latestAt', localInputToIso(event.target.value))} /></label>
          <label className="field">Horário inicial<input type="time" value={constraints.allowedStartTime || ''} onChange={event => updateConstraint('allowedStartTime', event.target.value)} /></label>
          <label className="field">Horário final<input type="time" value={constraints.allowedEndTime || ''} onChange={event => updateConstraint('allowedEndTime', event.target.value)} /></label>
          <label className="field">Duração (minutos)<input type="number" min="15" max="480" step="5" value={constraints.durationMinutes || ''} onChange={event => updateConstraint('durationMinutes', event.target.value ? Number(event.target.value) : undefined)} /></label>
          <label className="field">Máximo de rodadas<input type="number" min="1" max="8" value={constraints.maxRounds || ''} onChange={event => updateConstraint('maxRounds', event.target.value ? Number(event.target.value) : undefined)} /></label>
          <div className="field wide"><span>Dias permitidos</span><div className="weekday-list">{weekdays.map(([value, label]) => <label key={value}><input type="checkbox" checked={(constraints.allowedWeekdays || []).includes(value)} onChange={() => toggleWeekday(value)} />{label}</label>)}</div></div>
          <label className="field wide">Locais aceitos<input value={(constraints.locations || []).join(', ')} onChange={event => updateConstraint('locations', event.target.value.split(',').map(value => value.trim()).filter(Boolean))} placeholder="Ex.: online, escritório" /></label>
          <label className="field wide">Observações<textarea value={constraints.notes || ''} onChange={event => updateConstraint('notes', event.target.value)} placeholder="Condições que não podem ser ultrapassadas" /></label>
        </div>}
        {editingConstraints && !canApproveInitial && <div className="schedule-actions"><button type="button" className="primary" disabled={!!busy} onClick={() => void mutate('intervene', { constraints })}><MdCheckCircle />{busy === 'intervene' ? 'Salvando…' : 'Salvar novos limites'}</button></div>}
    </section>
    <section className="schedule-section">
        <h4>Até onde a secretária pode ir</h4>
        <div className="mode-options">
          <label className="mode-option"><input type="radio" name={`schedule-mode-${id}`} checked={mode === 'negotiate_only'} disabled={!canApproveInitial || !!busy} onChange={() => setMode('negotiate_only')} /><span><strong>Negociar apenas</strong>Você confirma o horário final.</span></label>
          <label className="mode-option"><input type="radio" name={`schedule-mode-${id}`} checked={mode === 'negotiate_and_book'} disabled={!canApproveInitial || !!busy} onChange={() => setMode('negotiate_and_book')} /><span><strong>Negociar e reservar</strong>Pode reservar dentro dos limites aprovados.</span></label>
        </div>
    </section>

    {canApproveFinal && <section className="schedule-section">
      <h4>Mensagem de confirmação final</h4>
      <textarea className="draft-preview" aria-label="Mensagem de confirmação final" value={draftMessage} disabled={!!busy} onChange={event => setDraftMessage(event.target.value)} />
      <p className="schedule-copy">Confira o horário e a mensagem antes da confirmação final.</p>
    </section>}

    {appointment ? <section className="appointment" aria-label={state === 'confirmed' ? 'Compromisso confirmado' : 'Proposta final'}>
      <strong>{state === 'confirmed' ? 'Compromisso confirmado' : 'Proposta pronta para sua decisão'}</strong>
      <span>{String(appointmentValue(appointment, 'title', 'summary') || item.request || 'Compromisso')}</span>
      <span>{asDate(appointmentValue(appointment, 'startAt', 'start', 'dateTime'))}{appointmentValue(appointment, 'endAt', 'end') ? ` até ${asDate(appointmentValue(appointment, 'endAt', 'end'))}` : ''}</span>
      {appointmentValue(appointment, 'location') ? <span>{String(appointmentValue(appointment, 'location'))}</span> : null}
      {item.calendarStatus && <span>{calendarLabels[String(item.calendarStatus)] || String(item.calendarStatus)}</span>}
    </section> : null}

    {events.length > 0 && <section className="schedule-section"><h4>Acompanhamento</h4><div className="timeline">{events.slice(-12).map((event, index) => <article key={event.id || `${eventDate(event)}-${index}`}><i /><div>{eventText(event)}{eventDate(event) && <time>{asDate(eventDate(event))}</time>}</div></article>)}</div></section>}

    {showIntervention && <section className="intervention"><label className="field">Mensagem de intervenção para o contato<textarea autoFocus value={intervention} onChange={event => setIntervention(event.target.value)} placeholder="Ex.: também consigo flexibilizar para terça à tarde" /></label><p className="schedule-copy">Esta mensagem será enviada ao contato e ficará registrada na negociação. Para assumir a conversa diretamente no WhatsApp, pause primeiro.</p></section>}

    <div className="schedule-actions">
      {canApproveInitial && <button type="button" className="primary" disabled={!!busy || !draftMessage.trim() || !selectedContactId || !selectedContactAuthorized} onClick={approveInitial}><MdCheckCircle />{busy === 'approve-initial' ? 'Aprovando…' : 'Aprovar início'}</button>}
      {canApproveFinal && <button type="button" className="primary" disabled={!!busy || !draftMessage.trim()} onClick={() => void mutate('approve-final', { message: draftMessage, finalProposal: item.proposedSlot })}><MdCheckCircle />{busy === 'approve-final' ? 'Confirmando…' : 'Aprovar final'}</button>}
      {canPause && <button type="button" disabled={!!busy} onClick={() => void mutate('pause')}><MdPause /> Pausar</button>}
      {canResume && <button type="button" disabled={!!busy || (outboundPauseReason&&!deliveryReviewed)} onClick={() => void mutate('resume')}><MdPlayArrow /> {outboundPauseReason?'Voltar para revisão':'Retomar'}</button>}
      {canIntervene && (showIntervention ? <button type="button" className="primary" disabled={!!busy || !intervention.trim()} onClick={() => void mutate('intervene', { message: intervention.trim() })}><MdSend /> Enviar intervenção</button> : <button type="button" disabled={!!busy} onClick={() => setShowIntervention(true)}><MdEdit /> Intervir</button>)}
      {canCancel && <button type="button" className="danger" disabled={!!busy || (unrecoverableOutboundPause&&!deliveryReviewed)} onClick={() => void mutate('cancel')}><MdCancel /> {unrecoverableOutboundPause?'Encerrar mandato':'Cancelar'}</button>}
      {canAcknowledgeAttention && <button type="button" className="primary" disabled={!!busy||!deliveryReviewed} onClick={()=>void mutate('acknowledge-attention')}><MdCheckCircle />{busy==='acknowledge-attention'?'Registrando…':'Marcar como conferido'}</button>}
      {canApproveInitial && !selectedContactAuthorized && <a href="/communications?channel=whatsapp&section=contacts"><MdPerson /> Autorizar contato</a>}
      <a href={conversationUrl}><MdOpenInNew /> Abrir conversa</a>
      <a href={inboxUrl}><MdInbox /> Abrir na inbox</a>
      {phoneDigits && <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer"><MdOpenInNew /> WhatsApp</a>}
    </div>
    {item.expiresAt && !terminalStates.has(state) && <span className="expiry">Esta autorização expira em {asDate(item.expiresAt)}.</span>}
  </Card>;
}
