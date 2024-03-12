function Triangle({triangle, color}) {
    const points = `${triangle.p1.x},${triangle.p1.y} ${triangle.p2.x},${triangle.p2.y} ${triangle.p3.x},${triangle.p3.y}`;
    return (
        <polygon points={points} fill={color} />
    );
}


export default Triangle;