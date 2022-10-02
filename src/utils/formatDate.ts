const formatDate = (date: string, showHours: number): string => {
   const dateFormatted = new Date(Number(date));
   if (showHours === 1){
      return dateFormatted.toLocaleTimeString("pt-BR", {timeZone: 'UTC' ,year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})
   }else{
      const year = dateFormatted.getFullYear();
   
      const day = dateFormatted.getDate() > 9 
      ? dateFormatted.getDate() : `0${dateFormatted.getDate()}`;
      
      const month = dateFormatted.getMonth() + 1 > 9
      ? dateFormatted.getMonth() + 1 : `0${dateFormatted.getMonth() + 1}`; 
   
      return `${year}-${month}-${day}`;
   }
};

export default formatDate;