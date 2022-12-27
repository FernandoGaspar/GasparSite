const formatCurrency = (current: number, arred: number): string => {
    let retorno: string = "0"
    if (arred == 1){
        retorno = current.toLocaleString( 
            'pt-br', 
            {
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0
            });
    } else {
        retorno = current.toLocaleString( 
            'pt-br', 
            {
                style: 'currency', 
                currency: 'BRL',
            });
    }
    return retorno
};

export default formatCurrency;