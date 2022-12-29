import React, { useEffect, useMemo, useState } from 'react'

interface IProgressBar {
    bgcolor: string;
    progress: number;
    height: number;
  }

const ProgressBar: React.FC<IProgressBar> = ({
        bgcolor, 
        progress, 
        height
}) => {
    const Parentdiv = {
        height: height,
        width: '100%',
        backgroundColor: '#D3D3D3',
        borderRadius: 40,
        margin: 10
      }
      
      const progresstext = {
        padding: 10,
        color: 'white',
        fontWeight: 900
      }
    return (
    <div style={Parentdiv}>
      <div style={{
            height: '100%',
            borderRadius:40,
            textAlign: 'right',
            backgroundColor: bgcolor,
            width: `${progress}%`,
            
            }}>
        <span style={progresstext}>{`${progress}%`}</span>
      </div>
    </div>
    )
}
  
export default ProgressBar;