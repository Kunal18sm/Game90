import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { addWalkable, addObstacle, removeWalkable, removeObstacle } from '../utils/collisionStore';

export function Ground() {
    const groundRef = useRef();

    useEffect(() => {
        const node = groundRef.current;
        if (node) addWalkable(node);
        return () => { if (node) removeWalkable(node); };
    }, []);

    return (
        <mesh ref={groundRef} position={[0, -1, 0]} receiveShadow>
            <boxGeometry args={[340, 2, 340]} />
            <meshLambertMaterial color={0x7cfc00} />
        </mesh>
    );
}

export function River() {
    const waterRef = useRef();
    const baseRef = useRef();
    const bank1Ref = useRef();
    const bank2Ref = useRef();

    const [geometry] = useState(() => {
        const geo = new THREE.PlaneGeometry(350, 14, 100, 6);
        geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position;
        geo.userData.origY = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) {
            geo.userData.origY[i] = pos.getY(i);
        }
        return geo;
    });

    useEffect(() => {
        const node1 = baseRef.current;
        const node2 = bank1Ref.current;
        const node3 = bank2Ref.current;
        if (node1) addWalkable(node1);
        if (node2) addWalkable(node2);
        if (node3) addWalkable(node3);

        return () => {
            if (node1) removeWalkable(node1);
            if (node2) removeWalkable(node2);
            if (node3) removeWalkable(node3);
        };
    }, []);

    return (
        <group position={[0, 0, 0]}>
            <RiverBed />
            <mesh ref={waterRef} geometry={geometry} position={[0, 0.2, 0]}>
                <meshPhysicalMaterial
                    color={0x00aaff}
                    transparent
                    opacity={0.75}
                    roughness={0.1}
                    metalness={0.2}
                    clearcoat={1.0}
                />
            </mesh>
            <RiverFishes />
        </group>
    );
}

function RiverBed() {
    const baseRef = useRef();
    const bank1Ref = useRef();
    const bank2Ref = useRef();

    useEffect(() => {
        const node1 = baseRef.current;
        const node2 = bank1Ref.current;
        const node3 = bank2Ref.current;
        if (node1) addWalkable(node1);
        if (node2) addWalkable(node2);
        if (node3) addWalkable(node3);

        return () => {
            if (node1) removeWalkable(node1);
            if (node2) removeWalkable(node2);
            if (node3) removeWalkable(node3);
        };
    }, []);

    return (
        <>
            <mesh ref={baseRef} position={[0, -0.1, 0]} receiveShadow>
                <boxGeometry args={[350, 0.5, 14]} />
                <meshPhongMaterial color={0x00bfff} transparent opacity={0.85} shininess={100} />
            </mesh>
            <mesh ref={bank1Ref} position={[0, 0.15, 7.5]}>
                <boxGeometry args={[350, 0.2, 1.5]} />
                <meshLambertMaterial color={0xdeb887} />
            </mesh>
            <mesh ref={bank2Ref} position={[0, 0.15, -7.5]}>
                <boxGeometry args={[350, 0.2, 1.5]} />
                <meshLambertMaterial color={0xdeb887} />
            </mesh>
        </>
    );
}

function Fish({ index }) {
    const fishRef = useRef();
    const dir = (index % 2 === 0) ? 1 : -1;
    const fx = -160 + (index * 8);
    const fz = -5 + (index % 4) * 3;
    const speed = (0.05 + (index % 3) * 0.02) * dir;

    // In React 18 / R3F useFrame scales time with elapsed / delta
    useFrame(() => {
        if (fishRef.current) {
            fishRef.current.position.x += speed * 0.8; // scaled a bit
            if (dir === 1 && fishRef.current.position.x > 160) fishRef.current.position.x = -160;
            if (dir === -1 && fishRef.current.position.x < -160) fishRef.current.position.x = 160;
        }
    });

    return (
        <group ref={fishRef} position={[fx, 0.05, fz]} rotation={[0, dir === -1 ? Math.PI : 0, 0]}>
            <mesh scale={[1.5, 0.8, 0.4]}>
                <sphereGeometry args={[0.3, 8, 4]} />
                <meshLambertMaterial color={0xff8c00} />
            </mesh>
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.2, 0.4, 3]} />
                <meshLambertMaterial color={0xff8c00} />
            </mesh>
        </group>
    );
}

function RiverFishes() {
    return (
        <>
            {Array.from({ length: 40 }).map((_, i) => (
                <Fish key={`fish-${i}`} index={i} />
            ))}
        </>
    );
}

export function Roads() {
    const groundSize = 340;
    const streetsZ = [25, 45, 65, 85, 105, 125, 145, -25, -45, -65, -85, -105, -125, -145];

    // Convert hooks to refs inside a sub-component for proper adding, or use multiple refs
    return (
        <group>
            <Road piece={[6, 0.05, groundSize]} pos={[-15, 0.02, 0]} />
            <Road piece={[6, 0.05, groundSize]} pos={[15, 0.02, 0]} />
            {streetsZ.map(z => (
                <Road key={`road-z-${z}`} piece={[groundSize, 0.05, 4]} pos={[0, 0.02, z]} />
            ))}
        </group>
    );
}

function Road({ piece, pos }) {
    const ref = useRef();
    useEffect(() => {
        const node = ref.current;
        if (node) addWalkable(node);
        return () => { if (node) removeWalkable(node); };
    }, []);
    return (
        <mesh ref={ref} position={pos} receiveShadow>
            <boxGeometry args={piece} />
            <meshLambertMaterial color={0x95a5a6} />
        </mesh>
    );
}

export function Bridge({ x }) {
    const planksRef = useRef();
    const railsRef = useRef();

    useEffect(() => {
        const node1 = planksRef.current;
        const node2 = railsRef.current;
        if (node1) addWalkable(node1);
        if (node2) addObstacle(node2);
        return () => {
            if (node1) removeWalkable(node1);
            if (node2) removeObstacle(node2);
        };
    }, []);

    const planks = [];
    let pIndex = 0;
    for (let z = -7.5; z <= 7.5; z += 1.0) {
        planks.push(
            <mesh
                key={`plank-${z}`}
                position={[0, 0.4, z]}
                rotation={[0, ((pIndex % 3) - 1) * 0.05, ((pIndex % 2) - 0.5) * 0.05]}
            >
                <boxGeometry args={[5.5, 0.2, 0.8]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
        );
        pIndex++;
    }

    return (
        <group position={[x, 0.5, 0]}>
            <group ref={planksRef}>
                {planks}
            </group>
            <group ref={railsRef}>
                {[-1, 1].map(side => (
                    <mesh key={`rail-${side}`} position={[side * 2.5, 1.2, 0]}>
                        <boxGeometry args={[0.5, 1.5, 16]} />
                        <meshLambertMaterial color={0x4a2e15} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export function Cloud({ cx, cz, i }) {
    const cloudRef = useRef();
    const subClouds = [];
    const fixedHeight = 40 + (i % 5) * 5;

    for (let j = 0; j < 4; j++) {
        const ox = (j % 2 === 0) ? 2 : -2;
        const oy = (j > 1) ? 1 : -1;
        const oz = (j % 3 === 0) ? 2 : -2;
        const subScale = 1.0 + (j % 3) * 0.2;
        subClouds.push(
            <mesh key={`subc-${j}`} position={[ox, oy, oz]} scale={[subScale, subScale, subScale]}>
                <sphereGeometry args={[2, 8, 8]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
        );
    }

    useFrame(() => {
        if (cloudRef.current) {
            cloudRef.current.position.x += 0.05 * (60 / 1000) * 16.6; // normalized speed
            if (cloudRef.current.position.x > 200) cloudRef.current.position.x = -200;
        }
    });

    return (
        <group ref={cloudRef} position={[cx, fixedHeight, cz]}>
            {subClouds}
        </group>
    );
}
