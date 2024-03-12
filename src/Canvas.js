import LogoButton from "./LogoButton";
import pointLogo from "./img/point.png";
import gonLogo from "./img/pentagon.png";
import delaunayLogo from "./img/delaunay.png";
import voronoiLogo from "./img/voronoi.png";
import Point from "./Point";
import holeLogo from "./img/hole.png";
import deleteLogo from "./img/delete.png";
import Gon, { createRegularPolygonVertices } from "./Gon";
import moveLogo from "./img/move.png";
import rotateLogo from "./img/rotate.png";
import resizeLogo from "./img/resize.png";
import saveLogo from "./img/save.png";
import React, { useState, useRef, useEffect } from 'react';
import { mouseToRelative } from "./utils";
import { PointClass } from "./Delaunay";
import Triangle from "./Triangle";
import Delaunator from 'delaunator';
import GridLines from "./GridLines";
import zoomInIcon from "./img/zoomIn.png";
import zoomOutIcon from "./img/zoomOut.png";
import zoomResetIcon from "./img/zoomReset.png";
import computeAvailableRegions from "./AvailableRegions";

import {  computeHoles, Hole } from "./HoleComputation";


function Canvas() {
    const [mode, setMode] = useState(null);
    const [nPoints, setNPoints] = useState(0);
    const [points, setPoints] = useState([]);
    const [gons, setGons] = useState([]);
    const [k, setK] = useState(5);
    const [r, setR] = useState(7);
    const [draggingPoint, setDraggingPoint] = useState(null);
    const [draggingGon, setDraggingGon] = useState(null);
    const [startingClick, setStartingClick] = useState(null);
    const [startingRadius, setStartingRadius] = useState(null);
    const [startingAngle, setStartingAngle] = useState(null);
    const [triangulation, setTriangulation] = useState([]);
    const [holes, setHoles] = useState([]);
    const [displayHoles, setDisplayHoles] = useState(false);
    const [displayTriangulation, setDisplayTriangulation] = useState(false);
    const [displayAvailableRegions, setDisplayAvailableRegions] = useState(false);
    const [availablePoints, setAvailablePoints] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [viewBox, setViewBox] = useState("0 0 1800 800");

    const canvasRef = useRef(null);

    const getAllPoints = () => {
        let answer = [];
        for (let i = 0; i < points.length; i++) {
            answer.push(new PointClass(points[i].x, points[i].y));
        }
        for (let i = 0; i < gons.length; i++) {
            let gon = gons[i];
            let gonPoints = createRegularPolygonVertices(gon.k, gon.x, gon.y, gon.radius, gon.angle);
            for (let j = 0; j < gonPoints.length; j++) {
                answer.push(new PointClass(gonPoints[j].x, gonPoints[j].y));
            }
        }
        return answer;
    }

    const onPointClick = (e) => {
        if(mode === 'point') {
            setMode(null);
        } else {
            setMode('point');
        }
        // console.log('points', getAllPoints());
    }

    const onGonClick = (e) => {
        if(mode === 'gon') {
            setMode(null);
        } else {
            setMode('gon');
        }
    }
    
    const onDeleteClick = (e) => {
        if(mode === 'delete') {
            setMode(null);
        } else {
            setMode('delete');
        }
    }

    const onHoleComputationClick = () => {
        if(!displayHoles) {
            setDisplayAvailableRegions(false);
            setDisplayTriangulation(false);
            updateHoles();
        }
        setDisplayHoles(!displayHoles);
        
    }
    
    const onAvailableRegionsClick = async () => {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        if(!displayAvailableRegions) {
            setDisplayHoles(false);
            setDisplayTriangulation(false);
            setDisplayAvailableRegions(!displayAvailableRegions);
            let totalAvailablePoints = [];
            let newAvailablePoints = []
            const allPoints = getAllPoints();
            let [x, y, width, height] = viewBox.split(" ").map(Number);
            for(let i = 0; i < 100; ++i) {
                console.log('iteration', i);
                newAvailablePoints = computeAvailableRegions(allPoints, r, x, y, x+width, y+height);
                totalAvailablePoints = totalAvailablePoints.concat(newAvailablePoints);
                if(i % 5 === 0) {
                    setAvailablePoints(totalAvailablePoints);
                    await delay(1);
                }
            }
            console.log('total available points', totalAvailablePoints.length);
           
        } else {
            setDisplayAvailableRegions(!displayAvailableRegions);
        }
        
    }
    
    const updateHoles = () => {
        let allPoints = getAllPoints();
        let holes = computeHoles(allPoints, r);
        setHoles(holes);
    }

    const onDelaunayClick = (e) => {
        if(!displayTriangulation) {
            setDisplayHoles(false);
            setDisplayAvailableRegions(false);
        }
        setDisplayTriangulation(!displayTriangulation);
        let allPoints = getAllPoints();
        let delaunay = Delaunator.from(allPoints, point => point.x, point => point.y);
        let triangles = [];
        for (let i = 0; i < delaunay.triangles.length; i += 3) {
            let p1 = allPoints[delaunay.triangles[i]];
            let p2 = allPoints[delaunay.triangles[i + 1]];
            let p3 = allPoints[delaunay.triangles[i + 2]];
            triangles.push({ p1: p1, p2: p2, p3: p3 });
        }
        setTriangulation(triangles);
        
    }

    const onMoveClick = (e) => {
        setMode('move');
    }
    
    const onSaveClick = (e) => {
        // export all points and gons to a file
        const data = {
            allPoints: getAllPoints(),
            gons: gons,
        };
        const stringToWrite = JSON.stringify(data, null, '\t');
        // open dialog to save file
        const blob = new Blob([stringToWrite], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
    
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = href;
        link.download = 'log.txt'; // Default file name if none is provided
        document.body.appendChild(link);
        link.click();
    
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }

    const onResizeClick = (e) => {
        setMode('resize');
    }

    const onRotateClick = (e) => {
        setMode('rotate');
    }

    const createNewPoint = (x, y) => {
        setPoints([...points, { x: x, y: y }]);
        setNPoints(nPoints + 1);
    }

    const createNewGon = (k, x, y, radius = 50) => {
        setGons([...gons, { k: k, x: x, y: y, radius: radius, angle: 0 }]);
        setNPoints(nPoints + k);
    }

    const handleCanvasClick = (e) => {
        // console.log('current mode:', mode);
        // console.log(canvasRef);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        // create new point
        if (mode === 'point') {
            createNewPoint(relativePoint.x, relativePoint.y);
            // create new gon
        } else if (mode === 'gon') {
            createNewGon(k, relativePoint.x, relativePoint.y);
        } else if (mode === 'delete') {
            
        }
        
        else {
            onDragStart(e);
        } 
    }
    
    const pointDelete = (e, id) => {
        e.stopPropagation(); 
        // console.log('point delete', id);
        setPoints(points.filter((point, index) => index !== id));
        setNPoints(nPoints - 1);
    }

    const gonDelete = (e, id) => {
        e.stopPropagation();
        // console.log('gon delete', id);
        setGons(gons.filter((gon, index) => index !== id));
        setNPoints(nPoints - gons[id].k);
    }

    const pointDragStart = (e, id) => {
        e.stopPropagation();
        setDraggingPoint(id);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        setStartingClick({ x: relativePoint.x, y: relativePoint.y });
        //console.log('point drag start', id, e);
    }

    const pointDragEnd = (e, id) => {
        setDraggingPoint(null);
    }

    const gonDragStart = (e, id) => {
        e.stopPropagation();
        setDraggingGon(id);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        setStartingClick({ x: relativePoint.x, y: relativePoint.y });
        setStartingRadius(gons[id].radius);
        setStartingAngle(gons[id].angle);
        //console.log('starting click', { x: relativePoint.x, y: relativePoint.y });
    }

    const gonDragEnd = (e, id) => {
        setDraggingGon(null);
        setStartingRadius(null);
        setStartingAngle(null);
    }

    const handleMouseUp = () => {
        pointDragEnd();
        gonDragEnd();
        onDragEnd();
        if(displayHoles) {
            updateHoles();
        }
    }

    const handlePointDrag = (e) => {
        let relativePoint = mouseToRelative(e, canvasRef.current);

        setPoints(points.map((point, index) => (
            index === draggingPoint ? { ...point, x: relativePoint.x, y: relativePoint.y } : point
        )));
    }

    const handleGonDrag = (e) => {
        //console.log('gon drag', e);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        setGons(gons.map((gon, index) => (
            index === draggingGon ? { ...gon, x: relativePoint.x, y: relativePoint.y } : gon
        )));
    }

    const handleGonResize = (e) => {
        //console.log('gon resize', e);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        let resizeBy = (relativePoint.x - startingClick.x);
        let newRadius = Math.max(20, startingRadius + resizeBy);
        setGons(gons.map((gon, index) => (
            index === draggingGon ? { ...gon, radius: newRadius } : gon
        )));
    }

    const handleGonRotate = (e) => {
        // console.log('gon rotate', e);
        let relativePoint = mouseToRelative(e, canvasRef.current);
        // console.log('relative point', relativePoint, 'starting click', startingClick);

        let dx = relativePoint.x - startingClick.x;
        // console.log('dx', dx);
        let angleChange = (Math.PI * dx) / 720;
        // console.log('angle change', angleChange);

        setGons(gons.map((gon, index) => (
            index === draggingGon ? { ...gon, angle: startingAngle + angleChange } : gon
        )));
    }

    const handleMouseMove = (e) => {
        if (draggingPoint !== null && mode === 'move') {
            // There is a point being dragged
            handlePointDrag(e);
            if(displayHoles) {
                updateHoles();
            }
        }
        if (draggingGon !== null && mode === 'move') {
            // There is a gon being dragged
            handleGonDrag(e);
            if(displayHoles) {
                updateHoles();
            }
        }
        if (draggingGon !== null && mode === 'resize') {
            // There is a gon being resized
            handleGonResize(e);
            if(displayHoles) {
                updateHoles();
            }
        }

        if (draggingGon !== null && mode === 'rotate') {
            // There is a gon being resized
            handleGonRotate(e);
            if(displayHoles) {
                updateHoles();
            }
        }
        if(isDragging && mode === 'move') {
            onDrag(e);
        }
    }

    const zoomIn = () => {
        // Example logic for zooming in
        // You can modify this logic based on your zooming requirements
        let [x, y, width, height] = viewBox.split(" ").map(Number);
        let step = Math.min(width, height) / 10;
        setViewBox(`${x + step / 2} ${y + step / 2} ${width - step} ${height - step}`);
    };

    const zoomOut = () => {
        // Example logic for zooming out
        let [x, y, width, height] = viewBox.split(" ").map(Number);
        let step = Math.min(width, height) / 10;
        setViewBox(`${x - step / 2} ${y - step / 2} ${width + step} ${height + step}`);
    };

    const resetTransform = () => {
        setViewBox("0 0 1200 800");
    }

    const onDragStart = (e) => {
        setIsDragging(true);
        setStartDrag({ x: e.clientX, y: e.clientY });
        console.log('drag start', e);
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        let [x, y, width, height] = viewBox.split(" ").map(Number);

        // Calculate the new x and y
        const dx = (startDrag.x - e.clientX) * (width / window.innerWidth);
        const dy = (startDrag.y - e.clientY) * (height / window.innerHeight);

        setViewBox(`${x + dx} ${y + dy} ${width} ${height}`);
        setStartDrag({ x: e.clientX, y: e.clientY });
    };

    const onDragEnd = () => {
        setIsDragging(false);
    };

    const decideCursor = () => {
        if(mode === 'move' && (isDragging || draggingPoint !== null || draggingGon !== null)) {
            return 'grabbing';
        }
        if(mode === 'move') {
            return 'move';
        }
        if(mode === 'point' || mode === 'gon') {
            return 'crosshair';
        }
        if(mode === 'delete') {
            return 'not-allowed'
        }
        if(mode === 'resize') {
            return 'nesw-resize';
        }
        if(mode === 'rotate') {
            return 'alias';
        }
        return 'pointer';
        
    }

    return (

        <div className="Canvas" >


            <svg ref={canvasRef} className="svgCanvas"
                // onClick={handleCanvasClick}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseDown={handleCanvasClick}
                // onMouseMove={onDrag}
                // onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd} // in case the cursor leaves the SVG area
                viewBox={viewBox}
                style={{cursor: decideCursor()}}
            >
                <GridLines />
                {displayAvailableRegions && 
                    availablePoints.map((point, index) => (
                        <Point key={index} id={index} x={point.x} y={point.y}
                            onMouseDown={() => {}}
                            onMouseUp={() => {}}
                            r={5}
                            fill={'yellowgreen'}
                        />))
                }
                {displayTriangulation && triangulation.map((triangle, index) => (
                    <Triangle key={index}
                        triangle={triangle}
                        color={`hsl(${(index * 137) % 360}, 70%, 60%)`} />
                ))}
                {displayHoles && holes.map((hole, index) => (
                    <Hole key={index} pointSequence={hole} color={`hsl(${(index * 137) % 360}, 70%, 60%)`} />
                ))}
                {points.map((point, index) => (
                    <Point key={index} id={index} x={point.x} y={point.y}
                        onMouseDown={mode === 'delete' ? pointDelete : pointDragStart}
                        onMouseUp={pointDragEnd}
                    />
                ))}
                {gons.map((gon, index) => (
                    <Gon key={index}
                        id={index}
                        k={gon.k}
                        radius={gon.radius}
                        angle={gon.angle}
                        xCenter={gon.x} yCenter={gon.y}
                        onMouseDown={mode === 'delete' ? gonDelete : gonDragStart}
                        onMouseUp={gonDragEnd}

                    />
                ))}
                

            </svg>

            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'row' }}>
                <LogoButton tooltip={"Delete"} onClick={onDeleteClick} logo={deleteLogo} selected={mode === 'delete'} />
                <LogoButton tooltip={"Rotate"} onClick={onRotateClick} logo={rotateLogo} selected={mode === 'rotate'} />
                <LogoButton tooltip={"Resize"} onClick={onResizeClick} logo={resizeLogo} selected={mode === 'resize'} />
                <LogoButton tooltip={"Move"} onClick={onMoveClick} logo={moveLogo} selected={mode === 'move'} />
                <LogoButton tooltip={"Add points"} onClick={onPointClick} logo={pointLogo} selected={mode === 'point'} />
                <LogoButton tooltip={"Add gons"} onClick={onGonClick} logo={gonLogo} selected={mode === 'gon'} />
                <p style={{ margin: 5 }}><i>sides: </i> </p><input type="number" id="k-form" value={k} onChange={(e) => setK(parseInt(e.target.value))} style={{ width: 25, height:35, marginLeft: 1, marginRight:50  }} />
                <LogoButton tooltip={"Delaunay Triangulation"} onClick={onDelaunayClick} logo={delaunayLogo} selected={displayTriangulation} />
                <LogoButton tooltip={"See availaible regions avoiding k-holes"} onClick={onAvailableRegionsClick} logo={voronoiLogo} selected={displayAvailableRegions} />
                <LogoButton tooltip={"Display current k-holes"} onClick={onHoleComputationClick} logo={holeLogo} selected={displayHoles} />
                <LogoButton tooltip={"Save current state"} onClick={onSaveClick} logo={saveLogo} selected={false} />
                <p style={{ margin: 5, marginLeft: 10 }}><i># points: </i>{nPoints}</p>
                <p style={{ margin: 5, marginLeft: 30 }}><b><i>k </i> (hole size): </b></p><input type="number" id="r-form" value={r} onChange={(e) => setR(parseInt(e.target.value))} style={{ width: 30, marginLeft: 3 }} />
            </div>

            <div className="tools" style={{ position: 'absolute', top: 450, left: 1210, display: 'flex', flexDirection: 'column' }}>
                <button className="zoomBtn" onClick={() => zoomIn()}><img src={zoomInIcon} height={"80%"} width={"100%"} alt={"Zoom in"}></img></button>
                <button className="zoomBtn" onClick={() => zoomOut()}><img src={zoomOutIcon} height={"80%"} width={"100%"} alt={"Zoom out"}></img></button>
                <button className="zoomBtn" onClick={() => resetTransform()}><img src={zoomResetIcon} height={"80%"} width={"100%"} alt={"Reset Zoom"}></img></button>
            </div>
        </div>

    );
}

export default Canvas;