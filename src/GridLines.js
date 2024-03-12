function GridLines() {
    const hlines = [];
    const vlines = [];
    for(let i = 0; i < 200; i++)  {
        let step = -10000 + i * 100;
        hlines.push({x1: -10000, y1: step, x2: 10000, y2: step});
        vlines.push({x1: step, y1: -10000, x2: step, y2: 10000});
    }
    
    return (
        <g>
            {hlines.map((line, index) => (
               <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} style={{stroke: 'lightgray'}}/> 
            ))}
            {vlines.map((line, index) => (
               <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} style={{stroke: 'lightgray'}}/> 
            ))}
        </g>
    )

}

export default GridLines;