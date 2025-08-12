import React, { createContext, useState, useContext, PropsWithChildren  } from 'react';

interface IShowNumberContext {
    buttonShowNumber(): void;
    showNumber: boolean;
}

const ShowNumberContext = createContext<IShowNumberContext>({} as IShowNumberContext);

const ShowNumberProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [showNumber, setShowNumber] = useState<boolean>(() => {
        const showNumberSaved = localStorage.getItem('@minha-carteira:showNumber');
        if(!showNumberSaved) {
            return true;
        }else{
            return false;
        }
    });

    function buttonShowNumber () {
        if(showNumber === true){
            setShowNumber(false);
            localStorage.setItem('@minha-carteira:showNumber', "false");
        }else{
            setShowNumber(true);
            localStorage.setItem('@minha-carteira:showNumber', "true");
        }
    };

    return (
        <ShowNumberContext.Provider value={{ buttonShowNumber, showNumber }}>
            {children}
        </ShowNumberContext.Provider>
    )
}

export function useShowNumber(): IShowNumberContext {
  return useContext(ShowNumberContext);
}

export { ShowNumberContext, ShowNumberProvider };