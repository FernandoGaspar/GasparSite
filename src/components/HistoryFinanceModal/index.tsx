import React, { useMemo, useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Button } from '@mui/material';
import NumberFormat from 'react-number-format';
import { useDialog } from 'react-st-modal';

import { URL_API } from '../../repositories/baseAPI';
import formatDate from '../../utils/formatDate';

import {
  Wrapper,
  HeaderCard,
  HeaderLeft,
  HeaderRight,
  TagDot,
  SectionCard,
  SectionTitleRow,
  FieldLabel,
  Grid2,
  SuggestionsRow,
  SuggestionChip,
  NoteTextArea,
  AttachRow,
  FileChip,
  EmptyHint,
  ParcelasHeader,
  ParcelasToggle,
  TableWrap,
  StyledTable,
  ActionsRow,
  FooterNote,
} from './styles';

interface IHistoryFinanceModalProps {
  idTransacao: string;
  data: string;
  descricao: string;
  valor: string;
  contaContabilCode: string;
  grupoContaContabil: string;
  subGrupoContaContabil: string;
  contaContabil: string;
  observacao: string;
  tagColor: string;
  obraGrupoCode: string;
  atualizaTransacao: (arg: string) => void;
}

interface IgrupoContaContabeis {
  idContaContabil: string;
  contaContabilCode: string;
  grupoContaContabil: string;
  subGrupoContaContabil: string;
  contaContabil: string;
}
interface IobraGrupoCode {
  subGrupoContaContabil: string;
  descricao: string;
}
interface IparcelasTransacao {
  id: number;
  DataParcela: string;
  ValorParcela: string;
  Descricao: string;
}

interface ITransacaoHistorico {
  idTransacoes: string;
  grupoContaContabil: string;
  subGrupoContaContabil: string;
  contaContabil: string;
}

interface ISugestaoConta {
  grupo: string;
  subGrupo: string;
  conta: string;
  ocorrencias: number;
}

type Option = { label: string; value: string };

const STORAGE = {
  usuarioId: '@minha-carteira:usuarioId',
};

const HistoryFinanceModal: React.FC<IHistoryFinanceModalProps> = ({
  idTransacao,
  data,
  descricao,
  valor,
  contaContabilCode,
  grupoContaContabil,
  subGrupoContaContabil,
  contaContabil,
  observacao,
  tagColor,
  obraGrupoCode,
  atualizaTransacao,
}) => {
  const dialog = useDialog();

  // ======= Loading flags =======
  const [saving, setSaving] = useState(false);
  const [loadingParcelas, setLoadingParcelas] = useState(false);

  // ======= Data sources =======
  const [grupoContaContabeis, setGrupoContaContabeis] = useState<IgrupoContaContabeis[]>([]);
  const [obraGrupoCodeData, setObraGrupoCodeData] = useState<IobraGrupoCode[]>([]);
  const [parcelasTransacao, setParcelasTransacao] = useState<IparcelasTransacao[]>([]);

  // ======= Controlled fields =======
  const [grupoContaSelecionado, setGrupoContaSelecionado] = useState<string>(grupoContaContabil || '');
  const [subGrupoContaSelecionado, setSubGrupoContaSelecionado] = useState<string>(subGrupoContaContabil || '');
  const [contaSelecionado, setContaSelecionado] = useState<string>(contaContabil || '');
  const [observacaoSelecionado, setObservacaoSelecionado] = useState<string>(observacao || '');
  const [obraGrupoCodeSelecionado, setObraGrupoCodeSelecionado] = useState<string>(obraGrupoCode || '');
  const [showParcelas, setShowParcelas] = useState<boolean>(false);

  const [sugestoesConta, setSugestoesConta] = useState<ISugestaoConta[]>([]);

  // ======= Upload state =======
  const [file, setFile] = useState<File>();
  const [binary, setBinary] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [linkFile, setLinkFile] = useState<string>();

  const idUsuario = localStorage.getItem(STORAGE.usuarioId) as string;

  // ======= API calls =======
  // O backend local não lida bem com várias chamadas simultâneas (a conexão
  // com o banco parece ser compartilhada), o que faz essa chamada falhar
  // aleatoriamente e deixar os selects vazios. Como é a mais importante do
  // popup, tentamos de novo uma vez antes de desistir.
  const getContasContabeis = async (tentativa = 1) => {
    try {
      const { data } = await axios.post(URL_API + '/contasContabeisTabela', { usuario: idUsuario });
      setGrupoContaContabeis(JSON.parse(data));
    } catch (e) {
      if (tentativa < 3) {
        setTimeout(() => getContasContabeis(tentativa + 1), 600 * tentativa);
      } else {
        console.log(e);
      }
    }
  };

  const getObraGrupoCode = async () => {
    try {
      const { data } = await axios.post(URL_API + '/obraGrupoCode', {});
      setObraGrupoCodeData(JSON.parse(data));
    } catch (e) {
      console.log(e);
    }
  };

  // Sugere Grupo/Subgrupo/Conta a partir de transações antigas com descrição parecida,
  // reaproveitando o /gastosSemFiltro (mesma busca usada na tela de listagem).
  // Esse endpoint parece ser lento/instável no backend local, então uma
  // falha aqui merece uma segunda tentativa antes de desistir em silêncio.
  const getSugestoesConta = async (tentativa = 1) => {
    const termoBusca = (descricao || '').replace(/\s*-\s*\d+\/\d+\s*$/, '').trim();
    if (!termoBusca) return;

    try {
      const { data } = await axios.post(URL_API + '/gastosSemFiltro', {
        usuario: idUsuario,
        tipo: grupoContaContabil,
        filtro: termoBusca,
      });

      const historico: ITransacaoHistorico[] = JSON.parse(data);
      const contagem = new Map<string, ISugestaoConta>();

      historico.forEach((item) => {
        if (String(item.idTransacoes) === String(idTransacao)) return;
        if (!item.contaContabil) return;

        const chave = `${item.grupoContaContabil}|${item.subGrupoContaContabil}|${item.contaContabil}`;
        const atual = contagem.get(chave);
        if (atual) {
          atual.ocorrencias += 1;
        } else {
          contagem.set(chave, {
            grupo: item.grupoContaContabil,
            subGrupo: item.subGrupoContaContabil,
            conta: item.contaContabil,
            ocorrencias: 1,
          });
        }
      });

      const top3 = Array.from(contagem.values())
        .sort((a, b) => b.ocorrencias - a.ocorrencias)
        .slice(0, 3);

      setSugestoesConta(top3);
    } catch (e) {
      if (tentativa < 2) {
        setTimeout(() => getSugestoesConta(tentativa + 1), 800);
      } else {
        console.log(e);
      }
    }
  };

  const aplicarSugestao = (sugestao: ISugestaoConta) => {
    setGrupoContaSelecionado(sugestao.grupo);
    setSubGrupoContaSelecionado(sugestao.subGrupo);
    setContaSelecionado(sugestao.conta);
  };

  const getArquivosPasta = async (id: string) => {
    try {
      const { data } = await axios.post(URL_API + '/getArquivo', { idTransacao: id });
      if (data?.[0]) {
        setFileName(data[0]);
        setLinkFile(URL_API + '/LinkFile?fileName=' + data[0]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getParcelasTransacao = async (id: string) => {
    // Abre/fecha, e carrega quando abrir
    const next = !showParcelas;
    setShowParcelas(next);
    if (!next) return;

    setLoadingParcelas(true);
    try {
      const { data } = await axios.post(URL_API + '/getParcelasTransacao', { idTransacao: id });
      setParcelasTransacao(JSON.parse(data));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingParcelas(false);
    }
  };

  const manageUploadedFile = async (bin: string, f: File, id: string) => {
    try {
      const slash = f.type.indexOf('/');
      const ext = slash >= 0 ? f.type.substring(slash + 1, slash + 4) : 'bin';
      const name = `${id}.${ext}`;

      const formData = new FormData();
      formData.append('file', f, name);

      await axios.post(URL_API + '/salvarArquivo', formData);
    } catch (e) {
      console.log(e);
    }
  };

  const alteraTransacao = async () => {
    setSaving(true);
    try {
      if (binary && file) {
        await manageUploadedFile(binary, file, idTransacao);
      }
      await axios.post(URL_API + '/setTransacoes', {
        idTransacao,
        grupoConta: grupoContaSelecionado,
        subGrupoConta: subGrupoContaSelecionado,
        conta: contaSelecionado,
        observacao: observacaoSelecionado,
        obraGrupoCode: obraGrupoCodeSelecionado,
      });
      atualizaTransacao('Atualiza transacoes');
      dialog.close();
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  const inativarTransacao = async () => {
    setSaving(true);
    try {
      await axios.post(URL_API + '/inativaTransacoes', { idTransacao });
      atualizaTransacao('Atualiza transacoes');
      dialog.close();
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  // ======= File input handlers =======
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const f = files[0];
    if (!f) return;
    fileToBinary(f)
      .then((bin) => {
        setFile(f);
        setBinary(bin);
      })
      .catch((reason) => {
        console.log('Error during upload', reason);
        event.target.value = '';
      });
  };

  function fileToBinary(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(String(reader.result));
      reader.readAsBinaryString(f);
    });
  }

  // ======= Options (label/value) =======
  const grupoContaOptions: Option[] = useMemo(() => {
    const unique = Array.from(new Set(grupoContaContabeis.map((i) => i.grupoContaContabil)));
    return unique.map((v) => ({ label: v, value: v }));
  }, [grupoContaContabeis]);

  const subGrupoContaOptions: Option[] = useMemo(() => {
    const filtered = grupoContaContabeis.filter((i) => i.grupoContaContabil === grupoContaSelecionado);
    const unique = Array.from(new Set(filtered.map((i) => i.subGrupoContaContabil)));
    return unique.map((v) => ({ label: v, value: v }));
  }, [grupoContaContabeis, grupoContaSelecionado]);

  const contaOptions: Option[] = useMemo(() => {
    const filtered = grupoContaContabeis.filter(
      (i) => i.grupoContaContabil === grupoContaSelecionado && i.subGrupoContaContabil === subGrupoContaSelecionado
    );
    return filtered.map((i) => ({ label: i.contaContabil, value: i.contaContabil }));
  }, [grupoContaContabeis, grupoContaSelecionado, subGrupoContaSelecionado]);

  const obraGrupoCodeOptions: Option[] = useMemo(() => {
    // Mantive sua lógica: filtra pelo subgrupo da conta selecionada
    const filtered = obraGrupoCodeData.filter((i) => contaSelecionado?.includes(i.subGrupoContaContabil));
    return filtered.map((i) => ({ label: i.descricao, value: i.descricao }));
  }, [contaSelecionado, obraGrupoCodeData]);

  // ======= Totais =======
  const valorTotalParcelas = useMemo(() => {
    let total = 0;
    parcelasTransacao.forEach((p) => {
      const n = Number(p.ValorParcela);
      if (!Number.isNaN(n)) total += n;
    });
    return total;
  }, [parcelasTransacao]);

  // ======= Effects =======
  useEffect(() => {
    let cancelado = false;

    // Chamadas em sequência (não em paralelo) porque o backend local não
    // segura bem várias requisições simultâneas nessa tela — disparar tudo
    // junto derrubava a chamada mais importante (contasContabeisTabela) e
    // deixava os selects vazios.
    (async () => {
      await getContasContabeis();
      if (cancelado) return;

      getArquivosPasta(idTransacao);
      getObraGrupoCode();
      getSugestoesConta();
    })();

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      {/* Header */}
      <HeaderCard>
        <HeaderLeft>
          <h3>{descricao || 'Transação'}</h3>
          <span>
            {formatDate(data, 0)} • #{idTransacao}
          </span>
        </HeaderLeft>

        <HeaderRight>
          <strong>
            <NumberFormat
              value={valor}
              displayType="text"
              prefix="R$ "
              fixedDecimalScale
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </strong>
          <div>
            <TagDot $color={tagColor || '#bdbdbd'} />
            <small>{contaContabilCode}</small>
          </div>
        </HeaderRight>
      </HeaderCard>

      {/* Form */}
      <SectionCard>
        <SectionTitleRow>Classificação</SectionTitleRow>

        <Grid2>
          <div>
            <FieldLabel>Grupo</FieldLabel>
            <Select
              classNamePrefix="react-select"
              value={grupoContaOptions.find((o) => o.value === grupoContaSelecionado) ?? null}
              onChange={(opt) => setGrupoContaSelecionado(opt?.value ?? '')}
              options={grupoContaOptions}
              placeholder="Selecione o grupo"
              isClearable={false}
            />
          </div>

          <div>
            <FieldLabel>Subgrupo</FieldLabel>
            <Select
              classNamePrefix="react-select"
              value={subGrupoContaOptions.find((o) => o.value === subGrupoContaSelecionado) ?? null}
              onChange={(opt) => setSubGrupoContaSelecionado(opt?.value ?? '')}
              options={subGrupoContaOptions}
              placeholder="Selecione o subgrupo"
              isClearable={false}
            />
          </div>

          <div>
            <FieldLabel>Conta contábil</FieldLabel>
            <Select
              classNamePrefix="react-select"
              value={contaOptions.find((o) => o.value === contaSelecionado) ?? null}
              onChange={(opt) => setContaSelecionado(opt?.value ?? '')}
              options={contaOptions}
              placeholder="Selecione a conta"
              isClearable={false}
            />
          </div>

          {subGrupoContaSelecionado === 'Construção' && (
            <div>
              <FieldLabel>Obra / Grupo</FieldLabel>
              <Select
                classNamePrefix="react-select"
                value={obraGrupoCodeOptions.find((o) => o.value === obraGrupoCodeSelecionado) ?? null}
                onChange={(opt) => setObraGrupoCodeSelecionado(opt?.value ?? '')}
                options={obraGrupoCodeOptions}
                placeholder="Selecione a obra"
                isClearable={false}
              />
            </div>
          )}
        </Grid2>

        {sugestoesConta.length > 0 && (
          <>
            <FieldLabel style={{ marginTop: 16 }}>Sugestão com base em transações parecidas — clique para aplicar</FieldLabel>
            <SuggestionsRow>
              {sugestoesConta.map((s) => (
                <SuggestionChip
                  key={`${s.grupo}|${s.subGrupo}|${s.conta}`}
                  type="button"
                  onClick={() => aplicarSugestao(s)}
                  title={`${s.grupo} · ${s.subGrupo}`}
                >
                  {s.conta} <small>×{s.ocorrencias}</small>
                </SuggestionChip>
              ))}
            </SuggestionsRow>
          </>
        )}
      </SectionCard>

      {/* Observação */}
      <SectionCard>
        <SectionTitleRow>Observação</SectionTitleRow>
        <NoteTextArea
        $size="sm"             // ← deixa baixinho
        rows={3}               // opcional: ajuda a definir a altura inicial
        value={observacaoSelecionado}
        onChange={(e) => setObservacaoSelecionado(e.target.value)}
        placeholder="Digite observações sobre a transação"
        />
      </SectionCard>

      {/* Anexos */}
      <SectionCard>
        <SectionTitleRow>Anexo</SectionTitleRow>
        <AttachRow>
          <Button variant="outlined" component="label">
            Anexar arquivo
            <input
              hidden
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              id="fileName"
              type="file"
              onChange={handleFileChange}
            />
          </Button>

          {fileName && linkFile ? (
            <FileChip href={linkFile} target="_blank" rel="noreferrer noopener">
              {fileName}
            </FileChip>
          ) : (
            <EmptyHint>Nenhum anexo encontrado</EmptyHint>
          )}
        </AttachRow>
      </SectionCard>

      {/* Parcelas */}
      <SectionCard>
        <ParcelasHeader>
          <SectionTitleRow>Parcelas</SectionTitleRow>
          <ParcelasToggle onClick={() => getParcelasTransacao(idTransacao)}>
            {showParcelas ? 'Esconder' : 'Mostrar'}
          </ParcelasToggle>
        </ParcelasHeader>

        {showParcelas && (
          <TableWrap>
            {loadingParcelas ? (
              <EmptyHint>Carregando...</EmptyHint>
            ) : (
              <StyledTable>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelasTransacao.map((item, idx) => {
                    const isHoje = formatDate(item.DataParcela, 0) === formatDate(data, 0);
                    return (
                      <tr key={idx} data-today={isHoje ? '1' : '0'}>
                        <td>{formatDate(item.DataParcela, 0)}</td>
                        <td>
                          <NumberFormat
                            value={item.ValorParcela}
                            displayType="text"
                            prefix="R$ "
                            fixedDecimalScale
                            decimalScale={2}
                            thousandSeparator="."
                            decimalSeparator=","
                          />
                        </td>
                        <td>{item.Descricao}</td>
                      </tr>
                    );
                  })}
                  <tr className="total">
                    <td>Total</td>
                    <td>
                      <NumberFormat
                        value={valorTotalParcelas}
                        displayType="text"
                        prefix="R$ "
                        fixedDecimalScale
                        decimalScale={2}
                        thousandSeparator="."
                        decimalSeparator=","
                      />
                    </td>
                    <td />
                  </tr>
                </tbody>
              </StyledTable>
            )}
          </TableWrap>
        )}
      </SectionCard>

      {/* Ações */}
      <ActionsRow>
        <Button variant="outlined" color="error" onClick={inativarTransacao} disabled={saving}>
          Inativar
        </Button>
        <Button variant="contained" color="primary" onClick={alteraTransacao} disabled={saving}>
          {saving ? 'Salvando...' : 'Confirmar'}
        </Button>
      </ActionsRow>

      <FooterNote>Última atualização: {new Date().toLocaleString()}</FooterNote>
    </Wrapper>
  );
};

export default HistoryFinanceModal;
