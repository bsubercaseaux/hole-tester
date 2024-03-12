export class PointClass {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Utility method to calculate distance squared (to avoid sqrt for performance)
    distanceSquaredTo(point) {
        let dx = this.x - point.x;
        let dy = this.y - point.y;
        return dx * dx + dy * dy;
    }
    
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}

function ccw (a, b, c) {
    return (b.x - a.x)*(c.y - a.y)-(c.x - a.x)*(b.y - a.y) > 0;
}

class Triangle {
    constructor(p1, p2, p3) {
        if(ccw(p1, p2, p3)) {
            this.p1 = p1;
            this.p2 = p2;
            this.p3 = p3;
        } else {
            this.p1 = p3;
            this.p2 = p2;
            this.p3 = p1;
            if(!ccw(this.p1, this.p2, this.p3)) {
               console.log("Triangle Error");
           }
        }
        
    }

    // Check if a point is in this triangle's circumcircle
    circumcircleContains(point) {
        // Using determinant of matrix to check circumcircle condition
        const ax = this.p1.x - point.x;
        const ay = this.p1.y - point.y;
        const bx = this.p2.x - point.x;
        const by = this.p2.y - point.y;
        const cx = this.p3.x - point.x;
        const cy = this.p3.y - point.y;

        const det = (ax * ax + ay * ay) * (bx * cy - by * cx) -
                    (bx * bx + by * by) * (ax * cy - ay * cx) +
                    (cx * cx + cy * cy) * (ax * by - ay * bx);

       // console.log(`Checking circumcircle: Triangle [(${this.p1.x}, ${this.p1.y}), (${this.p2.x}, ${this.p2.y}), (${this.p3.x}, ${this.p3.y})], Point (${point.x}, ${point.y}), Det: ${det}`);
        return det > 0;
    }
    
  
}

// Utility function to create the super triangle
function createSuperTriangle(points) {
    // Determine the bounding box of the points
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = minX;
    let maxY = minY;

    for (let i = 1; i < points.length; i++) {
        if (points[i].x < minX) minX = points[i].x;
        if (points[i].y < minY) minY = points[i].y;
        if (points[i].x > maxX) maxX = points[i].x;
        if (points[i].y > maxY) maxY = points[i].y;
    }

    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy);
    const midx = (minX + maxX) / 2;
    const midy = (minY + maxY) / 2;

    // Create vertices of the super triangle
    const p1 = new PointClass(midx - 20 * deltaMax, midy - deltaMax);
    const p2 = new PointClass(midx, midy + 20 * deltaMax);
    const p3 = new PointClass(midx + 20 * deltaMax, midy - deltaMax);

    return new Triangle(p1, p2, p3);
}


export function delaunayTriangulation(points) {
    let triangles = [];

    // Create a super triangle that contains all points
    let superTriangle = createSuperTriangle(points);
   // console.log('super triangle', superTriangle);
    triangles.push(superTriangle);

    // Add each point one by one
    points.forEach((point, index) => {
       console.log(`Processing point ${index}: (${point.x}, ${point.y})`);
        let edgeBuffer = [];

        // Remove triangles whose circumcircle contains the point
        triangles = triangles.filter(triangle => {
            if (triangle.circumcircleContains(point)) {
                edgeBuffer.push([triangle.p1, triangle.p2]);
                edgeBuffer.push([triangle.p2, triangle.p3]);
                edgeBuffer.push([triangle.p3, triangle.p1]);
                return false;
            }
            return true;
        });
        
        console.log(`Triangles after removing bad ones: ${triangles.length}`);
        console.log(`Edge buffer size: ${edgeBuffer.length}`);

        // Remove duplicate edges
        let uniqueEdges = edgeBuffer.filter((edge, index, self) =>
            index === self.findIndex(e =>
                (e[0] === edge[0] && e[1] === edge[1]) ||
                (e[0] === edge[1] && e[1] === edge[0])
            )
        );
        
        console.log(`Unique edges size: ${uniqueEdges.length}`);

        // Create new triangles from the unique edges to the point
        uniqueEdges.forEach(edge => {
            triangles.push(new Triangle(edge[0], edge[1], point));
        });
        
        console.log(`Triangles after adding new ones: ${triangles.length}`);
    });

    // Remove triangles that use the super triangle vertices
    triangles = triangles.filter(t =>
        !superTriangle.p1.equals(t.p1) && !superTriangle.p1.equals(t.p2) && !superTriangle.p1.equals(t.p3) &&
        !superTriangle.p2.equals(t.p1) && !superTriangle.p2.equals(t.p2) && !superTriangle.p2.equals(t.p3) &&
        !superTriangle.p3.equals(t.p1) && !superTriangle.p3.equals(t.p2) && !superTriangle.p3.equals(t.p3)
    );

    console.log(`Triangles after removing triangles that use super triangle vertices: ${triangles.length}`);
    return triangles;
}

