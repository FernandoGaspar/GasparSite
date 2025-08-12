import styled, { keyframes } from 'styled-components';

/* ====== Tokens simples ====== */
const radius = 16;
const shadow = '0 6px 18px rgba(17, 24, 39, 0.08)';
const border = '1px solid rgba(17, 24, 39, 0.06)';
const surface = (p: any) => p?.theme?.colors?.secondary || '#fff';
const textMuted = '#6b7280';
const text = '#111827';
const brand = '#6366f1'; // indigo-500
const brandSoft = '#eef2ff';

/* ====== Animações ====== */
const subtlePop = keyframes`
  from { transform: translateY(2px); opacity: .0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

/* ====== Estrutura ====== */
export const Wrapper = styled.div`
  width: 100%;
  max-width: 860px;
  padding: 20px;
  animation: ${subtlePop} .25s ease-out;
  
  @media (min-width: 600px) {
    padding: 28px;
  }
`;

/* ====== Cartões ====== */
export const SectionCard = styled.div`
  background: ${surface};
  border-radius: ${radius}px;
  border: ${border};
  box-shadow: ${shadow};
  padding: 18px;
  margin-bottom: 18px;
  transition: box-shadow .2s ease, transform .2s ease;
  
  &:hover {
    box-shadow: 0 10px 24px rgba(17,24,39,.10);
    transform: translateY(-1px);
  }
`;

/* ====== Header ====== */
export const HeaderCard = styled(SectionCard)`
  background: linear-gradient(180deg, #ffffff, #fafbff);
  padding: 20px;

  @supports (backdrop-filter: blur(6px)) {
    backdrop-filter: saturate(120%) blur(4px);
  }

  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
`;

export const HeaderLeft = styled.div`
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.25;
    color: ${text};
  }
  span {
    display: inline-block;
    margin-top: 6px;
    color: ${textMuted};
    font-size: 12.5px;
  }
`;

export const HeaderRight = styled.div`
  text-align: right;

  strong {
    display: block;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: .2px;
    color: ${text};
  }

  .meta {
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    gap: 10px;

    small {
      color: ${textMuted};
      font-size: 12px;
    }
  }
`;

export const TagDot = styled.span<{ $color: string }>`
  --c: ${({ $color }) => $color || '#bdbdbd'};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 12%, transparent);
`;

/* ====== Títulos de seção / campos ====== */
export const SectionTitleRow = styled.div`
  font-weight: 800;
  font-size: 13.5px;
  letter-spacing: .2px;
  margin-bottom: 14px;
  color: ${text};
`;

export const FieldLabel = styled.div`
  font-size: 12px;
  color: ${textMuted};
  margin-bottom: 8px;
`;

/* ====== Grid ====== */
export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 780px) {
    grid-template-columns: 1fr 1fr;
  }

  /* harmoniza o react-select */
  .react-select__control {
    border-radius: 10px !important;
    min-height: 42px;
    border-color: rgba(17,24,39,.12) !important;
    box-shadow: none !important;
  }
  .react-select__control--is-focused {
    border-color: ${brand} !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.15) !important;
  }
`;

/* ====== Observação ====== */
export const NoteTextArea = styled.textarea<{ $size?: 'sm' | 'md' | 'lg' }>`
  width: 100%;
  min-height: ${({ $size }) => ($size === 'sm' ? '64px' : $size === 'lg' ? '140px' : '96px')};
  padding: ${({ $size }) => ($size === 'sm' ? '8px 10px' : '12px 14px')};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '14px')};
  resize: vertical;
  border: 1px solid rgba(17,24,39,.12);
  border-radius: 12px;
  outline: none;
  background: linear-gradient(180deg, #fff, #fcfcff);
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99,102,241,.15);
  }
`;

/* ====== Anexos ====== */
export const AttachRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FileChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${brandSoft};
  border: 1px solid #c7d2fe;
  color: #4338ca;
  text-decoration: none;
  font-size: 12.5px;
  padding: 7px 12px;
  border-radius: 999px;
  transition: transform .15s ease, background .15s ease;

  &:hover {
    background: #e0e7ff;
    transform: translateY(-1px);
  }
`;

export const EmptyHint = styled.div`
  color: ${textMuted};
  font-size: 12.5px;
`;

/* ====== Parcelas ====== */
export const ParcelasHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ParcelasToggle = styled.button`
  border: 1px solid rgba(17,24,39,.12);
  background: #fff;
  border-radius: 10px;
  font-size: 12.5px;
  padding: 7px 12px;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;

  &:hover {
    background: #f9fafb;
    transform: translateY(-1px);
  }
`;

export const TableWrap = styled.div`
  margin-top: 12px;
  border: 1px solid rgba(17,24,39,.08);
  border-radius: 14px;
  overflow: hidden;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: linear-gradient(180deg, #f8fafc, #f3f4f6);
  }

  th, td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(17,24,39,.06);
    text-align: left;
    vertical-align: middle;
  }

  tbody tr:nth-child(odd) {
    background: #fcfcff;
  }

  tbody tr[data-today='1'] {
    background: #f5f7ff;
  }

  tbody tr:hover td {
    background: #f9fafb;
  }

  tbody tr.total td {
    font-weight: 900;
    background: linear-gradient(180deg, #f8fafc, #f3f4f6);
    border-bottom: none;
  }
`;

/* ====== Ações (barra fixa) ====== */
export const ActionsRow = styled.div`
  position: sticky;
  bottom: -20px; /* fica “coladinho” ao fim do modal */
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0 4px;

  @supports (backdrop-filter: blur(6px)) {
    background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,1));
    backdrop-filter: blur(6px);
  }
`;

export const FooterNote = styled.div`
  margin-top: 8px;
  font-size: 11.5px;
  color: ${textMuted};
`;
