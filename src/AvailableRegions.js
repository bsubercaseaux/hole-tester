import { computeHoles } from "./HoleComputation";
import { PointClass } from "./Delaunay";
import PoissonDiskSampling from "./PoissonDisc";

export default function computeAvailableRegions(allPoints, k, x1, y1, x2, y2) {
    const prevHoles = computeHoles(allPoints, k);
    let nSamples = 200;
    let grid = {minX: x1, maxX: x2, minY: y1, maxY: y2};
    let validPoints = [];
    let pds = new PoissonDiskSampling(grid.minX, grid.minY, grid.maxX, grid.maxY, 16, 5);
    let samplePoints = pds.generatePoints(nSamples);
    console.log("samplePoints", samplePoints);
    for(let i = 0; i < samplePoints.length; ++i) {
        console.log('point i', samplePoints[i]);
        let p = new PointClass(samplePoints[i].x, samplePoints[i].y);
        if(computeHoles([...allPoints, p], k).length === prevHoles.length) {
            validPoints.push(p);
        }
    }
    //console.log("validPoints", validPoints);
    return validPoints;
}