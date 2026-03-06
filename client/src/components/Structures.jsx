import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { addObstacle, removeObstacle } from '../utils/collisionStore';
import { getColor } from './constants';

export function House({ x, z, rotationY }) {
    const ref = useRef();
    useEffect(() => {
        const node = ref.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const color = useMemo(() => getColor(x, z), [x, z]);
    const size = 3;

    return (
        <group ref={ref} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, size / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[size, size, size]} />
                <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[0, size + 0.1, 0]} castShadow>
                <boxGeometry args={[size + 0.4, 0.2, size + 0.4]} />
                <meshLambertMaterial color={0xaaaaaa} />
            </mesh>
            <mesh position={[0, 1.3 / 2, size / 2 + 0.05]}>
                <boxGeometry args={[0.8, 1.3, 0.1]} />
                <meshLambertMaterial color={0x5c4033} />
            </mesh>
        </group>
    );
}

export function Building({ x, z, rotationY }) {
    const ref = useRef();
    useEffect(() => {
        const node = ref.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const color = useMemo(() => getColor(x, z), [x, z]);
    const width = 4;
    const height = 6 + ((Math.abs(x) + Math.abs(z)) % 4) * 1.5;
    const depth = 4;

    const rows = Math.floor(height / 1.5) - 1;
    const cols = Math.floor(width / 1.2);
    const windows = [];
    for (let r = 1; r <= rows; r++) {
        for (let c = 0; c < cols; c++) {
            let startX = -(cols * 1.2) / 2 + 0.6;
            windows.push(
                <mesh key={`win-${r}-${c}`} position={[startX + c * 1.2, r * 1.5 + 1, depth / 2 + 0.05]}>
                    <boxGeometry args={[0.6, 0.8, 0.15]} />
                    <meshLambertMaterial color={0x87CEFA} />
                </mesh>
            );
        }
    }

    return (
        <group ref={ref} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshLambertMaterial color={color} />
            </mesh>
            <mesh position={[0, height + 0.4, 0]}>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshLambertMaterial color={0xcccccc} />
            </mesh>
            <mesh position={[0, 2 / 2, depth / 2 + 0.05]}>
                <boxGeometry args={[1.5, 2, 0.15]} />
                <meshLambertMaterial color={0x222222} />
            </mesh>
            {windows}
        </group>
    );
}

export function Tree({ x, z }) {
    const ped = useRef();
    useEffect(() => {
        const node = ped.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    return (
        <group ref={ped} position={[x, 0, z]} scale={[0.8, 0.8, 0.8]}>
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
                <meshLambertMaterial color={0x5c4033} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[1.5, 8, 8]} />
                <meshLambertMaterial color={0x228b22} />
            </mesh>
        </group>
    );
}

export function StreetLight({ x, z }) {
    const pole = useRef();
    useEffect(() => {
        const node = pole.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    return (
        <group ref={pole} position={[x, 3, z]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.1, 0.15, 6, 8]} />
                <meshLambertMaterial color={0x2c3e50} />
            </mesh>
            <mesh position={[0, 3, 0.2]}>
                <boxGeometry args={[0.8, 0.2, 0.4]} />
                <meshLambertMaterial color={0x2c3e50} />
            </mesh>
            <mesh position={[0, 2.9, 0.3]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color={0xffffee} />
            </mesh>
        </group>
    );
}
