import styled, { keyframes } from 'styled-components';

/* ====== Animações ====== */
const subtlePop = keyframes`
  from { transform: translateY(2px); opacity: .0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

/* ====== Estrutura ====== */
export const Wrapper = styled.div`
  width: 100%;
  max-width: 860px;
  padding: 16px;
  animation: ${subtlePop} .25s ease-out;
  color: ${props => props.theme.colors.white};

  @media (min-width: 600px) {
    padding: 22px;
  }
`;

/* ====== Cartões ====== */
export const SectionCard = styled.div`
  background: ${props => props.theme.colors.tertiary};
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,.14);
  padding: 18px;
  margin-bottom: 16px;
`;

/* ====== Header ====== */
export const HeaderCard = styled(SectionCard)`
  background: ${props => props.theme.colors.tertiary};

  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
`;

export const HeaderLeft = styled.div`
  h3 {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    line-height: 1.25;
    color: ${props => props.theme.colors.white};
  }
  span {
    display: inline-block;
    margin-top: 6px;
    color: ${props => props.theme.colors.gray};
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
    color: ${props => props.theme.colors.white};
  }

  > div {
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    small {
      color: ${props => props.theme.colors.gray};
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
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 18%, transparent);
`;

/* ====== Títulos de seção / campos ====== */
export const SectionTitleRow = styled.div`
  font-weight: 800;
  font-size: 13.5px;
  letter-spacing: .2px;
  margin-bottom: 14px;
  color: ${props => props.theme.colors.white};
`;

export const FieldLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.gray};
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

  /* harmoniza o react-select com o tema escuro */
  .react-select__control {
    border-radius: 10px !important;
    min-height: 42px;
    background: ${props => props.theme.colors.secondary} !important;
    border-color: rgba(148,163,184,.25) !important;
    box-shadow: none !important;
  }
  .react-select__control--is-focused {
    border-color: ${props => props.theme.colors.success} !important;
    box-shadow: 0 0 0 3px rgba(6,214,160,.15) !important;
  }
  .react-select__single-value {
    color: ${props => props.theme.colors.white} !important;
  }
  .react-select__input-container {
    color: ${props => props.theme.colors.white} !important;
  }
  .react-select__placeholder {
    color: ${props => props.theme.colors.gray} !important;
  }
  .react-select__menu {
    background: ${props => props.theme.colors.secondary} !important;
    border: 1px solid rgba(148,163,184,.2);
  }
  .react-select__option {
    background: transparent !important;
    color: ${props => props.theme.colors.white} !important;
  }
  .react-select__option--is-focused {
    background: ${props => props.theme.colors.tertiary} !important;
  }
  .react-select__option--is-selected {
    background: ${props => props.theme.colors.success} !important;
    color: ${props => props.theme.colors.black} !important;
  }
  .react-select__indicator-separator {
    background: rgba(148,163,184,.25) !important;
  }
`;

/* ====== Sugestões rápidas ====== */
export const SuggestionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

export const SuggestionChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(6,214,160,.35);
  background: rgba(6,214,160,.1);
  color: ${props => props.theme.colors.white};

  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;

  &:hover {
    background: rgba(6,214,160,.2);
    transform: translateY(-1px);
  }

  small {
    color: ${props => props.theme.colors.success};
    font-weight: 700;
  }
`;

/* ====== Observação ====== */
export const NoteTextArea = styled.textarea<{ $size?: 'sm' | 'md' | 'lg' }>`
  width: 100%;
  min-height: ${({ $size }) => ($size === 'sm' ? '64px' : $size === 'lg' ? '140px' : '96px')};
  padding: ${({ $size }) => ($size === 'sm' ? '8px 10px' : '12px 14px')};
  font-size: ${({ $size }) => ($size === 'sm' ? '13px' : '14px')};
  resize: vertical;
  border: 1px solid rgba(148,163,184,.25);
  border-radius: 12px;
  outline: none;
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};

  &::placeholder {
    color: ${props => props.theme.colors.gray};
  }

  &:focus {
    border-color: ${props => props.theme.colors.success};
    box-shadow: 0 0 0 4px rgba(6,214,160,.15);
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
  background: rgba(6,214,160,.1);
  border: 1px solid rgba(6,214,160,.35);
  color: ${props => props.theme.colors.success};
  text-decoration: none;
  font-size: 12.5px;
  padding: 7px 12px;
  border-radius: 999px;
  transition: transform .15s ease, background .15s ease;

  &:hover {
    background: rgba(6,214,160,.2);
    transform: translateY(-1px);
  }
`;

export const EmptyHint = styled.div`
  color: ${props => props.theme.colors.gray};
  font-size: 12.5px;
`;

/* ====== Parcelas ====== */
export const ParcelasHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ParcelasToggle = styled.button`
  border: 1px solid rgba(148,163,184,.25);
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  border-radius: 10px;
  font-size: 12.5px;
  padding: 7px 12px;
  cursor: pointer;
  transition: border-color .15s ease, transform .15s ease;

  &:hover {
    border-color: ${props => props.theme.colors.success};
    transform: translateY(-1px);
  }
`;

export const TableWrap = styled.div`
  margin-top: 12px;
  border: 1px solid rgba(148,163,184,.16);
  border-radius: 14px;
  overflow: hidden;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.white};

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: ${props => props.theme.colors.secondary};
  }

  th, td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(148,163,184,.14);
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${props => props.theme.colors.gray};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  tbody tr[data-today='1'] {
    background: rgba(6,214,160,.08);
  }

  tbody tr:hover td {
    background: rgba(148,163,184,.06);
  }

  tbody tr.total td {
    font-weight: 900;
    background: ${props => props.theme.colors.secondary};
    border-bottom: none;
  }
`;

/* ====== Ações (barra fixa) ====== */
export const ActionsRow = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  margin: 10px -16px -16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;

  background: ${props => props.theme.colors.secondary};
  border-top: 1px solid rgba(148,163,184,.14);

  @media (min-width: 600px) {
    margin: 10px -22px -22px;
    padding: 14px 22px;
  }
`;

export const FooterNote = styled.div`
  margin-top: 8px;
  font-size: 11.5px;
  color: ${props => props.theme.colors.gray};
`;
