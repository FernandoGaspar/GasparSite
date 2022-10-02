import React, { useMemo, useState, useEffect } from 'react';
import Select from 'react-select'
import axios from 'axios';
import { ChangeEvent } from 'react';
import Button from '@material-ui/core/Button';
import { URL_API } from "../../repositories/baseAPI";
import { useDialog } from 'react-st-modal';
import formatDate from '../../utils/formatDate';
import NumberFormat from 'react-number-format';

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
    atualizaTransacao: (arg: string) => void
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
    atualizaTransacao
})  => {
    const dialog = useDialog();
    const [grupoContaContabeis, setGrupoContaContabeis] = useState<IgrupoContaContabeis[]>([]);

    const [obraGrupoCodeData, setObraGrupoCodeData] = useState<IobraGrupoCode[]>([]);
    const [parcelasTransacao, setParcelasTransacao] = useState<IparcelasTransacao[]>([]);

    const [grupoContaSelecionado, setGrupoContaSelecionado] = useState<string>(grupoContaContabil);
    const [subGrupoContaSelecionado, setSubGrupoContaSelecionado] = useState<string>(subGrupoContaContabil);
    const [contaSelecionado, setContaSelecionado] = useState<string>(contaContabil);
    const [observacaoSelecionado, setObservacaoSelecionado] = useState<string>(observacao);

    const [obraGrupoCodeSelecionado, setObraGrupoCodeSelecionado] = useState<string>(obraGrupoCode);
    const [showParcelas, setShowParcelas] = useState<boolean>(false);

    const [file, setFile] = useState<File>();
    const [binary, setBinary] = useState<string>();

    const [fileName, setFileName] = useState<string>();
    const [LinkFile, setLinkFile] = useState<string>();
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

    const getContasContabeis = () => {
        axios.post (URL_API+"/contasContabeisTabela", {
            usuario: idUsuario,
        })
        .then((response) => {
            const { data } = response
            setGrupoContaContabeis(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getObraGrupoCode = () => {
        axios.post (URL_API+"/obraGrupoCode", {
        })
        .then((response) => {
            const { data } = response
            setObraGrupoCodeData(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const grupoConta = useMemo(() => {
        let uniqueGrupoConta: string[] = [];

        grupoContaContabeis.forEach(item => {
            if(!uniqueGrupoConta.includes(item.grupoContaContabil)){
                uniqueGrupoConta.push(item.grupoContaContabil)
           }
        });

        return uniqueGrupoConta.map(item => {
            return {
                label: item,
            }
        })
    },[grupoContaContabeis]);

    const subGrupoConta = useMemo(() => {
        let uniqueSubGrupoConta: string[] = [];
        const filteredData = grupoContaContabeis.filter (item => {
            return grupoContaSelecionado?.includes(item.grupoContaContabil);
        })
        filteredData.forEach(item => {
            if(!uniqueSubGrupoConta.includes(item.subGrupoContaContabil)){
                uniqueSubGrupoConta.push(item.subGrupoContaContabil)
           }
        });
        return uniqueSubGrupoConta.map(item => {
            return {
                label: item,
            }
        })
    },[grupoContaContabeis, grupoContaSelecionado]);

    const contas = useMemo(() => {
        const filteredData = grupoContaContabeis.filter (item => {
            return subGrupoContaSelecionado?.includes(item.subGrupoContaContabil) && grupoContaSelecionado?.includes(item.grupoContaContabil);
        })
        return filteredData.map(item => {
            return {
                label: item.contaContabil,
            }
        })
    },[grupoContaContabeis, grupoContaSelecionado, subGrupoContaSelecionado]);

    const obraGrupoCodeList = useMemo(() => {
        const filteredData = obraGrupoCodeData.filter (item => {
            return contaSelecionado?.includes(item.subGrupoContaContabil);
        })
        return filteredData.map(item => {
            return {
                label: item.descricao,
            }
        })
    },[contaSelecionado, obraGrupoCodeData]);

    const alteraTransacao = () => {
        if (binary !== undefined || file !== undefined){
            manageUploadedFile(binary!, file!, idTransacao!, descricao!);
        }
        axios.post (URL_API+"/setTransacoes", {
            idTransacao: idTransacao,
            grupoConta: grupoContaSelecionado,
            subGrupoConta: subGrupoContaSelecionado,
            conta: contaSelecionado,
            observacao: observacaoSelecionado,
            obraGrupoCode: obraGrupoCodeSelecionado
        })
        .catch((error) => {
          console.log(error)
        })
        atualizaTransacao("Atualiza transacoes");
        dialog.close();
    }

    const inativarTransacao = () => {
        axios.post (URL_API+"/inativaTransacoes", {
            idTransacao: idTransacao,
        })
        .catch((error) => {
          console.log(error)
        })
        atualizaTransacao("Atualiza transacoes");
        dialog.close();
    }

    function manageUploadedFile(binary: string, file: File, idTransacao: string, descricao: string) {

        let local = file.type.indexOf("/")
        let extensao = file.type.substring(local+1, local+4)
        let fileName = idTransacao+"." + extensao

        var formData = new FormData();
        formData.append("file", file, fileName);

        axios.post (URL_API+"/salvarArquivo", formData,  {
        })
        .catch((error) => {
          console.log(error)
        })
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        event.persist();
        Array.from(event.target.files!).forEach(file => {
            getFileFromInput(file)
                .then((binary) => {
                    setFile(file);
                    setBinary(binary);
                }).catch(function (reason) {
                    console.log(`Error during upload ${reason}`);
                    event.target.value = ''; // to allow upload of same file if error occurs
                });
        });
    }

    function getFileFromInput(file: File): Promise<any> {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = function () { resolve(reader.result); };
            reader.readAsBinaryString(file);
        });
    }

    const getArquivosPasta = (idTransacao: string) => {
        axios.post (URL_API+"/getArquivo", {
            idTransacao: idTransacao,
        })
        .then((response) => {
            const { data } = response
            setFileName(data[0])
            setLinkFile(URL_API+"/LinkFile?fileName="+data[0])
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getParcelasTransacao = (idTransacao: string) => {
        setShowParcelas(!showParcelas)
        axios.post (URL_API+"/getParcelasTransacao", {
            idTransacao: idTransacao,
        })
        .then((response) => {
            const { data } = response
            setParcelasTransacao(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })

    }

    const dadoFiltrado = useMemo(() => {
        let dadoFiltrado = []
        dadoFiltrado = parcelasTransacao
        return dadoFiltrado
    },[parcelasTransacao]);

    const valorTotalDadoFiltrado = useMemo(() => {
        let total: number = 0.00;
        dadoFiltrado.forEach(item => {
            try{
                total += Number(item.ValorParcela)
            }catch{
                throw new Error('Invalid amount! Amount must be number.')
            }
        });

        return Math.round(total);

        // return 0;
    }, [dadoFiltrado])

    useEffect(() => {
        getArquivosPasta (idTransacao);
        getContasContabeis();
        getObraGrupoCode();
    },[]);
    return (
        <div style = {{ margin: "20px", height: "465px"  }} >
            <input/>
            <div>
                <Select
                    defaultInputValue = { grupoContaSelecionado }
                    onChange={(e) => { setGrupoContaSelecionado(e!.label) }}
                    options={ grupoConta }
                    />
            </div>
            <br/>
            <div>
            <Select
                    defaultInputValue = { subGrupoContaSelecionado }
                    onChange={(e) => { setSubGrupoContaSelecionado(e!.label) }}
                    options={ subGrupoConta }
                    />
            </div>
            <br/>
            <div>
                <Select
                    defaultInputValue = { contaSelecionado }
                    onChange={(e) => { setContaSelecionado(e!.label) }}
                    options={ contas }
                    />
            </div>
            <br/>
            {(() => {
                if (subGrupoContaSelecionado === "Construção"){
                    return <Select
                            defaultInputValue = { obraGrupoCodeSelecionado }
                            onChange={(e) => { setObraGrupoCodeSelecionado(e!.label) }}
                            options={ obraGrupoCodeList }
                            />
                }
            })()}
            <br/>
            <div className="col">
                    <textarea style = {{width: "100%",
                                        border:"solid 1px grey",
                                    }}
                        defaultValue={ observacao as string}
                        onChange={(e) => { setObservacaoSelecionado (e!.target.value) }}
                        />
            </div>
            <br/>
            <br/>
            <input
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                id="fileName"
                multiple = { true }
                type="file"
                defaultValue= { fileName }
                onChange={ handleFileChange } />
                { fileName ?
            <a
                style = {{ fontSize:"80%"  }}
                href={ LinkFile }
                target="_blank"
                rel="noreferrer noopener"
                >
                Arquivo: { fileName }
            </a>
            : <br/>}

            <Button
                onClick={async () => {getParcelasTransacao(idTransacao);}}
                style={{float: "right"}}
                >
                        Parcelas
            </Button>
            <br/>
            {( showParcelas ? 
                <table style={{"borderWidth":"1px", 'borderColor':"black", 'borderStyle':'solid'}}>
                    <thead >
                    <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Descrição</th>
                    </tr>
                    </thead>
                    <tbody>             
                    {
                        dadoFiltrado.map((item, key) => {                          
                            return (
                                <tr 
                                    key = {key} 
                                    style={{ "backgroundColor": formatDate(item.DataParcela, 0) === formatDate(data, 0)? "#BEBEBE" : ""}} 
                                    
                                    >
                                    <td>{formatDate(item.DataParcela, 0)}</td>
                                    <td>
                                    &nbsp;
                                            <NumberFormat
                                                value = {item.ValorParcela}
                                                displayType={'text'}
                                                prefix={"R$"}
                                                fixedDecimalScale={true}
                                                decimalScale={2}
                                                thousandSeparator={"."}
                                                decimalSeparator={","}
                                                />
                                    </td>
                                    <td>&nbsp;{item.Descricao}</td>
                                </tr>
                            )
                            })
                    }           <tr style = {{ "fontStyle": "bold"}}>
                                    <td>Total</td>
                                    <td>
                                        <NumberFormat
                                                value = {valorTotalDadoFiltrado}
                                                displayType={'text'}
                                                prefix={"R$"}
                                                fixedDecimalScale={true}
                                                decimalScale={2}
                                                thousandSeparator={"."}
                                                decimalSeparator={","}
                                                />
                                    </td>                                    
                                </tr>
                                    
                    </tbody>
                </table>
                : <></>
            )}
            <br/>
            <br/>
            <br/>
            
            <div>
                <Button
                    style = {{
                        border:"solid 1px black",
                        float: "left",
                        minHeight: "100%",
                    }}
                    color="primary"
                    onClick={() => {
                        inativarTransacao();
                        }}
                        >
                        Inativar
                </Button>

                <Button
                    style = {{
                        border:"solid 1px black",
                        float: "right",
                            }}
                    color="primary"
                    onClick={() => {
                            alteraTransacao();
                        }}
                        >
                        Confirmar
                </Button>
            </div>

            <br/>
            <br/>

        </div>
        )
    }

export default HistoryFinanceModal;



