import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';
import { MdAdd, MdCheckCircle, MdClose, MdEdit, MdRefresh, MdSearch } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { idempotencyConfig } from '../../utils/idempotency';

export type ContactChannel = {
  id?: number;
  type: string;
  address: string;
  label?: string;
  isPrimary?: boolean;
  isAllowed?: boolean;
  agentAllowed?: boolean;
};
export type CanonicalContact = {
  id: string;
  displayName: string;
  contactType?: 'person' | 'company' | 'service' | string;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
  version?: number;
  channels: ContactChannel[];
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  contacts: CanonicalContact[];
  loading?: boolean;
  loadError?: string;
  onReload: () => Promise<void>;
  onChange: (contacts: CanonicalContact[]) => void;
};
type Editor = {
  displayName: string;
  contactType: 'person' | 'company' | 'service';
  tags: string;
  notes: string;
  channels: ContactChannel[];
  isActive: boolean;
};

const typeLabels: Record<string, string> = { person: 'Pessoa', company: 'Empresa', service: 'Serviço' };
const emptyEditor = ():Editor => ({ displayName: '', contactType: 'person', tags: '', notes: '', channels: [{ type:'whatsapp', address:'', label:'WhatsApp', isPrimary:true, isAllowed:true, agentAllowed:false }], isActive: true });
const messageOf = (error:any, fallback:string) => error?.response?.data?.message || fallback;
const unwrap = (data:any): CanonicalContact => data?.contact || data?.item || data;
const digitsOf = (value:string) => value.replace(/\D/g, '');
export const maskContactAddress = (value:string) => {
  if (!value) return 'Não informado';
  if (value.includes('*')) return value;
  const digits = digitsOf(value);
  if (digits.length < 7) return value;
  return `${digits.slice(0, 2)} ••••• ${digits.slice(-4)}`;
};

export default function ContactManager({ contacts, loading, loadError, onReload, onChange }:Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CanonicalContact | null | undefined>(undefined);
  const [form, setForm] = useState<Editor>(emptyEditor);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return contacts;
    return contacts.filter(contact => [
      contact.displayName, contact.contactType, contact.notes, ...(contact.tags || []),
      ...contact.channels.flatMap(channel => [channel.label, channel.address, channel.type]),
    ].some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(term)));
  }, [contacts, search]);

  const begin = (contact?:CanonicalContact) => {
    setEditing(contact || null);
    setForm(contact ? {
      displayName: contact.displayName,
      contactType: contact.contactType === 'company' || contact.contactType === 'service' ? contact.contactType : 'person',
      tags: (contact.tags || []).join(', '),
      notes: contact.notes || '',
      channels: contact.channels.map(channel => ({
        ...channel,
        isAllowed: !!channel.isAllowed,
        agentAllowed: !!channel.isAllowed && !!channel.agentAllowed,
      })),
      isActive: contact.isActive !== false,
    } : emptyEditor());
    setError('');
    setNotice('');
  };

  const save = async () => {
    const primaryChannel = form.channels.find(channel => channel.isPrimary) || form.channels[0];
    if (!form.displayName.trim() || !primaryChannel?.address.trim() || busy) return;
    setBusy('save'); setError(''); setNotice('');
    try {
      const channels = form.channels.map((channel,index) => ({
        ...channel,
        address:channel.address.trim(),
        label:channel.label?.trim() || 'WhatsApp',
        isPrimary:channel.isPrimary || (!form.channels.some(value=>value.isPrimary) && index===0),
        isAllowed:!!channel.isAllowed,
        agentAllowed:!!channel.isAllowed && !!channel.agentAllowed,
      }));
      const payload = {
        displayName: form.displayName.trim(),
        contactType: form.contactType,
        tags: form.tags.split(',').map(value => value.trim()).filter(Boolean),
        notes: form.notes.trim(),
        isActive: form.isActive,
        channels,
        ...(editing ? { expectedVersion: editing.version } : {}),
      };
      const response = editing
        ? await axios.patch(`${URL_API}/contacts/${encodeURIComponent(editing.id)}`, payload, idempotencyConfig('contact-update'))
        : await axios.post(`${URL_API}/contacts`, payload, idempotencyConfig('contact-create'));
      const saved = unwrap(response.data);
      onChange(editing ? contacts.map(contact => contact.id === saved.id ? saved : contact) : [saved, ...contacts]);
      setNotice(editing ? 'Contato atualizado.' : 'Contato criado.');
      setEditing(undefined);
    } catch (cause:any) {
      if (cause?.response?.status === 409) {
        setError('Este contato foi alterado em outra tela. Recarregue e revise os dados antes de salvar novamente.');
      } else setError(messageOf(cause, 'Não foi possível salvar o contato.'));
    } finally { setBusy(''); }
  };

  const reload = async () => {
    setBusy('reload'); setError('');
    try { await onReload(); }
    catch (cause) { setError(messageOf(cause, 'Não foi possível atualizar os contatos.')); }
    finally { setBusy(''); }
  };

  const primaryIndex=Math.max(0,form.channels.findIndex(channel=>channel.isPrimary));
  const primaryChannel=form.channels[primaryIndex]||emptyEditor().channels[0];
  const updateChannel=(index:number,changes:Partial<ContactChannel>)=>setForm(current=>({
    ...current,
    channels:current.channels.map((channel,channelIndex)=>{
      if(channelIndex!==index)return channel;
      const next={...channel,...changes};
      if(next.isAllowed===false)next.agentAllowed=false;
      return next;
    }),
  }));

  if (editing !== undefined) return <section className="contact-editor panel-like">
    <header><div><span>{editing ? 'EDITAR CONTATO' : 'NOVO CONTATO'}</span><h3>{editing?.displayName || 'Contato canônico'}</h3></div><button className="icon-action" aria-label="Fechar editor" onClick={() => setEditing(undefined)}><MdClose /></button></header>
    {error && <div className="wa-banner error" role="alert">{error}</div>}
    <div className="contact-form">
      <label>Nome usado no Gaspar<input value={form.displayName} onChange={event => setForm({ ...form, displayName:event.target.value })} placeholder="Ex.: Dra. Marina" /></label>
      <label>Tipo<select value={form.contactType} onChange={event => setForm({ ...form, contactType:event.target.value as Editor['contactType'] })}><option value="person">Pessoa</option><option value="company">Empresa</option><option value="service">Serviço</option></select></label>
      <label className="wide">Tags<input value={form.tags} onChange={event => setForm({ ...form, tags:event.target.value })} placeholder="Ex.: saúde, prioridade" /></label>
      <label className="wide">Notas<textarea value={form.notes} onChange={event => setForm({ ...form, notes:event.target.value })} rows={3} placeholder="Contexto útil para reconhecer este contato" /></label>
      <label>Número principal do WhatsApp<input value={primaryChannel.address} onChange={event => updateChannel(primaryIndex,{address:event.target.value})} inputMode="tel" placeholder="+55 11 99999-9999" /></label>
      <label>Rótulo do canal principal<input value={primaryChannel.label||''} onChange={event => updateChannel(primaryIndex,{label:event.target.value})} placeholder="WhatsApp principal" /></label>
    </div>
    <section className="channel-permission-editor"><header><h4>Permissões por canal</h4><p>Nenhum canal recebe permissão por herança. Revise cada um separadamente.</p></header>{form.channels.map((channel,index)=>{const channelName=channel.label||`WhatsApp ${index+1}`;return <article key={channel.id||`${channel.type}-${index}`}><div className="channel-permission-title"><FaWhatsapp/><span><strong>{channelName}{channel.isPrimary?' · principal':''}</strong>{maskContactAddress(channel.address)}</span></div><div className="contact-permissions">
      <label><input aria-label={`Canal ativo — ${channelName}`} type="checkbox" checked={!!channel.isAllowed} onChange={event => updateChannel(index,{isAllowed:event.target.checked,agentAllowed:event.target.checked?channel.agentAllowed:false})} /><span><strong>Canal ativo</strong>Permite usar este endereço no WhatsApp.</span></label>
      <label><input aria-label={`Permitir secretária — ${channelName}`} type="checkbox" checked={!!channel.agentAllowed} disabled={!channel.isAllowed} onChange={event => updateChannel(index,{agentAllowed:event.target.checked})} /><span><strong>Permitir que a secretária negocie neste canal</strong>Consentimento específico; as demais aprovações continuam obrigatórias.</span></label>
    </div></article>})}</section>
    <div className="contact-permissions contact-level-permission"><label><input type="checkbox" checked={form.isActive} onChange={event => setForm({ ...form, isActive:event.target.checked })} /><span><strong>Contato ativo</strong>Mantenha disponível nas buscas e sugestões.</span></label></div>
    <footer><button className="secondary-action" onClick={() => setEditing(undefined)}>Cancelar</button><button className="primary-action" disabled={busy === 'save' || !form.displayName.trim() || !primaryChannel.address.trim()} onClick={() => void save()}><MdCheckCircle />{busy === 'save' ? 'Salvando…' : 'Salvar contato'}</button></footer>
  </section>;

  return <section className="contacts-panel">
    <header className="section-heading"><div><span>AGENDA DA SECRETÁRIA</span><h2>Contatos canônicos</h2><p>Um nome local e permissões claras evitam que conversas parecidas sejam confundidas.</p></div><div><button className="secondary-action" disabled={busy === 'reload'} onClick={() => void reload()}><MdRefresh /> Atualizar</button><button className="primary-action" onClick={() => begin()}><MdAdd /> Novo contato</button></div></header>
    {(error || loadError) && <div className="wa-banner error" role="alert">{error || loadError}</div>}{notice && <div className="wa-banner success"><MdCheckCircle />{notice}</div>}
    <div className="wa-search"><MdSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, tag, nota ou canal" /></div>
    {loading ? <div className="wa-empty">Carregando contatos…</div> : <div className="contact-grid">{visible.map(contact => <article key={contact.id} className={`contact-card ${contact.isActive === false ? 'inactive' : ''}`}>
      <header><div className="contact-avatar">{contact.displayName.slice(0, 2).toUpperCase()}</div><div><h3>{contact.displayName}</h3><span>{typeLabels[contact.contactType || 'person'] || contact.contactType}</span></div><button aria-label={`Editar ${contact.displayName}`} onClick={() => begin(contact)}><MdEdit /></button></header>
      {(contact.tags || []).length > 0 && <div className="contact-tags">{contact.tags?.map(tag => <span key={tag}>{tag}</span>)}</div>}
      {contact.notes && <p>{contact.notes}</p>}
      <div className="channel-list">{contact.channels.map((channel, index) => <div key={channel.id || `${channel.type}-${index}`}><FaWhatsapp /><span><strong>{channel.label || 'WhatsApp'}</strong>{maskContactAddress(channel.address)}</span><b className={channel.isAllowed && channel.agentAllowed ? 'allowed' : ''}>{!channel.isAllowed ? 'Canal bloqueado' : channel.agentAllowed ? 'Secretária autorizada' : 'Sem autorização'}</b></div>)}</div>
    </article>)}{!visible.length && <div className="wa-empty">{contacts.length ? 'Nenhum contato corresponde à busca.' : 'Cadastre o primeiro contato para a secretária reconhecer nomes e permissões.'}</div>}</div>}
  </section>;
}
