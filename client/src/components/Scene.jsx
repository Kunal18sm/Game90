import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { Player } from './Player';
import { Ground, River, Roads, Bridge, Cloud } from './Environment';
import { House, Building, Tree, StreetLight } from './Structures';
import { Factory } from './Factory';
import { Bank } from './Bank';
import { Shop } from './Shop';
import { Godam } from './Godam';
import { Farm, Park } from './ParkFarm';
import { OtherPlayers } from './OtherPlayers';

export default function Scene() {
    const cols = [-145, -125, -105, -85, -65, -45, -25, -5, 5, 25, 45, 65, 85, 105, 125, 145];
    const allZRows = [15, 35, 55, 75, 95, 115, 135, 155, -15, -35, -55, -75, -95, -115, -135, -155];

    const parkPositions = [
        [-85, 55], [85, 55], [-45, 95], [45, 95],
        [-85, -55], [85, -55], [-45, -95], [45, -95]
    ];

    const shopTypes = ['banana', 'fish', 'clothes'];

    // Generate City Grid
    const gridElements = [];
    allZRows.forEach((z, rIdx) => {
        cols.forEach((x, cIdx) => {
            if (parkPositions.some(p => p[0] === x && p[1] === z)) return; // Space reserved for parks
            if (x === -25 && z === -35) return; // Bank
            if (x === 125 && z === -135) return; // Factory

            const key = `grid-${x}-${z}`;

            if (Math.abs(x) >= 145 || Math.abs(z) >= 155 || (Math.abs(x) >= 125 && z >= 135)) {
                gridElements.push(<Farm key={key} x={x} z={z} />);
                return;
            }

            const plotID = Math.abs(rIdx * 10 + cIdx);

            if (z > 0) {
                if (plotID % 5 === 0) {
                    gridElements.push(<Tree key={key} x={x} z={z} />);
                } else {
                    const rotY = ((z - 15) % 40 === 0) ? 0 : Math.PI;
                    gridElements.push(<House key={key} x={x} z={z} rotationY={rotY} />);
                }
            } else {
                if (plotID % 6 === 0) {
                    gridElements.push(<Tree key={key} x={x} z={z} />);
                } else if (Math.abs(z) <= 55 && Math.abs(x) <= 45) {
                    // Changed modulo logic so type index 0 (banana) isn't excluded
                    if (plotID % 4 !== 0) {
                        const type = shopTypes[plotID % shopTypes.length];
                        const rotY = ((Math.abs(z) - 15) % 40 === 0) ? Math.PI : 0;
                        gridElements.push(<Shop key={key} x={x} z={z} type={type} rotationY={rotY} />);
                    } else {
                        const rotY = ((Math.abs(z) - 15) % 40 === 0) ? Math.PI : 0;
                        gridElements.push(<Building key={key} x={x} z={z} rotationY={rotY} />);
                    }
                } else {
                    if (plotID % 7 === 0) {
                        const gType = (plotID % 2 === 0) ? 'banana' : 'clothes';
                        const rotY = ((Math.abs(z) - 15) % 40 === 0) ? Math.PI : 0;
                        gridElements.push(<Godam key={key} x={x} z={z} type={gType} rotationY={rotY} />);
                    } else {
                        const rotY = ((Math.abs(z) - 15) % 40 === 0) ? Math.PI : 0;
                        gridElements.push(<Building key={key} x={x} z={z} rotationY={rotY} />);
                    }
                }
            }
        });
    });

    const borderTrees = [];
    for (let rx = -140; rx <= 140; rx += 20) {
        if (Math.abs(rx) > 20) {
            borderTrees.push(<Tree key={`btree-1-${rx}`} x={rx} z={10} />);
            borderTrees.push(<Tree key={`btree-2-${rx}`} x={rx} z={-10} />);
        }
    }

    const streetLights = [];
    for (let z = -150; z <= 150; z += 20) {
        if (Math.abs(z) > 10) {
            streetLights.push(<StreetLight key={`sl-1-${z}`} x={-11} z={z} />);
            streetLights.push(<StreetLight key={`sl-2-${z}`} x={19} z={z} />);
        }
    }

    const clouds = [];
    for (let i = 0; i < 30; i++) {
        const cx = (i % 6) * 60 - 150;
        const cz = Math.floor(i / 6) * 60 - 150;
        clouds.push(<Cloud key={`cloud-${i}`} cx={cx} cz={cz} i={i} />);
    }

    return (
        <>
            <OrbitControls
                makeDefault
                enableDamping={true}
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2 - 0.02}
                minDistance={2}
                maxDistance={2500}
                zoomSpeed={3.0}
                panSpeed={2.5}
                screenSpacePanning={false}
            />

            <Ground />
            <River />
            <Roads />
            <Bridge x={-15} />
            <Bridge x={15} />

            <Bank x={-25} z={-35} rotationY={0} />
            <Factory x={125} z={-135} rotationY={0} />

            {parkPositions.map((pos, idx) => (
                <Park key={`park-${idx}`} x={pos[0]} z={pos[1]} />
            ))}

            {gridElements}
            {borderTrees}
            {streetLights}
            {clouds}

            <OtherPlayers />
            <Player />
        </>
    );
}
