class PoissonDiskSampling {
    constructor(x1, y1, x2, y2, minDist, maxTries = 30) {
        this.x1 = x1;
        this.y1 = y1;
        this.rectWidth = x2 - x1;
        this.rectHeight = y2 - y1;

        this.minDist = minDist;
        this.cellSize = minDist / Math.sqrt(2);
        this.gridWidth = Math.ceil(this.rectWidth / this.cellSize);
        this.gridHeight = Math.ceil(this.rectHeight / this.cellSize);
        this.maxTries = maxTries;
        this.grid = new Array(this.gridWidth * this.gridHeight).fill(null);
        this.activeList = [];
        this.samplePoints = [];
    }
    
    generatePoints(k) {
        // Start with a random point
        let firstPoint = this._randomPoint();
        this._addToGrid(firstPoint);
        this.activeList.push(firstPoint);
        this.samplePoints.push(firstPoint);
        
        
        while (this.samplePoints.length < k && this.activeList.length > 0) {
            let listIndex = Math.floor(Math.random() * this.activeList.length);
            let point = this.activeList[listIndex];
            let found = false;
            console.log("point", point);
    
            for (let n = 0; n < this.maxTries; n++) {
                let newPoint = this._generatePointAround(point);
                if (this._isValidPoint(newPoint)) {
                    this._addToGrid(newPoint);
                    this.activeList.push(newPoint);
                    this.samplePoints.push(newPoint);
                    found = true;
                    break;
                }
            }
    
            if (!found) {
                this.activeList.splice(listIndex, 1);
            }
        }
    
        // If we haven't reached k points and the active list is empty, it means we can't add more points
        // respecting the minimum distance. You might want to handle this case depending on your use case.
        console.log("samplePoints", this.samplePoints);
        return this.samplePoints.map(point => ({x: point.x + this.x1, y: point.y + this.y1}));
    }
    


    _generatePointAround(point) {
        let r1 = Math.random();
        let r2 = Math.random();
        let radius = this.minDist * (r1 + 1);
        let angle = 2 * Math.PI * r2;
        let newX = point.x + radius * Math.cos(angle);
        let newY = point.y + radius * Math.sin(angle);
        return { x: newX, y: newY };
    }

    _isValidPoint(point) {
        if (point.x < 0 || point.x >= this.rectWidth || point.y < 0 || point.y >= this.rectHeight) {
            return false;
        }

        let gridX = Math.floor(point.x / this.cellSize);
        let gridY = Math.floor(point.y / this.cellSize);

        let startX = Math.max(gridX - 2, 0);
        let startY = Math.max(gridY - 2, 0);
        let endX = Math.min(gridX + 2, this.gridWidth - 1);
        let endY = Math.min(gridY + 2, this.gridHeight - 1);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                let neighbor = this.grid[x + y * this.gridWidth];
                if (neighbor) {
                    let d = Math.hypot(neighbor.x - point.x, neighbor.y - point.y);
                    if (d < this.minDist) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    _addToGrid(point) {
        let gridX = Math.floor(point.x / this.cellSize);
        let gridY = Math.floor(point.y / this.cellSize);
        this.grid[gridX + gridY * this.gridWidth] = point;
    }

    _randomPoint() {
        return { x: Math.random() * this.rectWidth, y: Math.random() * this.rectHeight };
    }
}

export default PoissonDiskSampling;