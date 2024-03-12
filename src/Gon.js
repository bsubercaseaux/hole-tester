import Point from "./Point";

export function createRegularPolygonVertices(k, centerX, centerY, radius, angle) {
    if (k < 3) {
        throw new Error('A polygon must have at least 3 sides.');
    }

    const vertices = [];
    const angleStep = (2 * Math.PI) / k; // Angle between vertices

    const startingAngle = angle + 3*Math.PI/2;
    for (let i = 0; i < k; i++) {
        const angle =  startingAngle + angleStep * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push({ x, y });
    }

    return vertices;
}

function Gon({id, k, angle, radius, xCenter, yCenter, onMouseDown, onMouseUp}) {
    const points = createRegularPolygonVertices(k, xCenter, yCenter, radius, angle);
    return (
      <g 
        onMouseDown={(e) => onMouseDown(e, id)} 
        onMouseUp={(e) => onMouseUp(e, id)}>
        {points.map((point, index) => (
            <Point key={index} id={index} x={point.x} y={point.y}
                onMouseDown={e => onMouseDown(e, id)}
                onMouseUp={e => onMouseUp(e, id)}
            /> 
        ))}
      </g>
    );
  }
  
export default Gon;