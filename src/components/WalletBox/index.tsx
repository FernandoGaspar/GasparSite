import React, { useMemo } from 'react';
import NumberFormat from 'react-number-format';

import dolarImg from '../../assets/dolar.svg';
import arrowUpImg from '../../assets/arrow-up.svg';
import arrowDownImg from '../../assets/arrow-down.svg';
import { useShowNumber } from '../../hooks/showNumber';

import { Container }  from './styles';

interface IWalletBoxProps {
    title: string;
    amount: number;
    footerlabel: string;
    icon: 'dolar' | 'arrowUp' | 'arrowDown';
    color: string;
}

const WalletBox: React.FC<IWalletBoxProps> = ({
    title,
    amount,
    footerlabel,
    icon,
    color
}) => {

    const iconSelected = useMemo(() => {
        switch (icon) {
            case 'dolar':
                return dolarImg;
            case 'arrowUp': 
                return arrowUpImg;
            case 'arrowDown':
                return arrowDownImg;
            default:
              return undefined;
        }
    },[icon]);
    
    const { showNumber } = useShowNumber();

    return (
        <Container color={color}>
            <span className="icon-chip">
                <i style={{ WebkitMaskImage: `url(${iconSelected})`, maskImage: `url(${iconSelected})` }} />
            </span>
            <span className="label">{title}</span>
            <h1>
                <strong>R$ </strong>

                { showNumber ?
                    <NumberFormat
                        value={amount}
                        displayType={'text'}
                        decimalSeparator=","
                        thousandSeparator="."
                        fixedDecimalScale={true}
                        decimalScale={2}
                    />
                    :
                    <NumberFormat
                        value={amount}
                        displayType={'text'}
                        format={"*****"}
                    />
                    }

            </h1>
            <small>{footerlabel}</small>
        </Container>
    );
}

export default WalletBox;