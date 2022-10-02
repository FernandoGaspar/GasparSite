interface IDataPost {
    idTransacoes: string
    idOrigem: string
    tabelaOrigem: string
    Data: string
    Descricao: string
    Valor: string
    contaContabilCode: string
    grupoContaContabil: string
    subGrupoContaContabil: string
    contaContabil: string
    Observacao: string
  }
  
  type DataPostProps = {
    dataPost: IDataPost
  }
 
  type ApiDataType = {
    message: string
    status: string
    transacoes: IDataPost[]
    transacao?: IDataPost
  }