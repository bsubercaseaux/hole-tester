//function Point({ id, cx, cy, onPointDragStart, onPointDragEnd, isPointDragging, isSelected, convexHullIndex }) {
function Point({id, x, y, onMouseDown, onMouseUp, r=7, fill='black'}) {
    //const colors = ['black', 'DarkSlateBlue', 'DarkViolet', 'red', 'orange', 'green', 'blue']
    // console.log('point', id, isSelected, convexHullIndex);
    return (
      <>
        <circle
          cx={x}
          cy={y}
          r={""+r}
          fill={fill}
          onMouseDown={(e) => onMouseDown(e, id)}
          onMouseUp={(e) => onMouseUp(e, id)}
        />
        {/* <text x={cx + 18} y={cy + 18} fill="white" fontSize="smaller" style={{ userSelect: 'none' }}>
          {id}
        </text> */}
      </>
    );
  }
  
  export default Point;