import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { addObstacle, removeObstacle } from '../utils/collisionStore';

export function Factory({ x, z, rotationY = 0 }) {
    const factoryRef = useRef();
    useEffect(() => {
        const node = factoryRef.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const teeth = [];
    for (let i = -9; i <= 9; i += 6) {
        teeth.push(
            <mesh key={`tooth-${i}`} position={[i, 13.25, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.5, 1, 5.6]} castShadow>
                <coneGeometry args={[3, 2.5, 4]} />
                <meshLambertMaterial color={0x555555} />
            </mesh>
        );
    }

    const chimneys = [];
    for (let i = -7; i <= 7; i += 7) {
        chimneys.push(
            <group key={`chim-${i}`}>
                <mesh position={[i, 15, -4]} castShadow>
                    <cylinderGeometry args={[1, 1.5, 14, 16]} />
                    <meshLambertMaterial color={0x333333} />
                </mesh>
                {Array.from({ length: 5 }).map((_, j) => (
                    <Smoke key={`smoke - ${j} `} x={i} y={22 + j * 2} z={-4} j={j} />
                ))}
            </group>
        );
    }

    return (
        <group ref={factoryRef} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 6, 0]} castShadow>
                <boxGeometry args={[24, 12, 16]} />
                <meshLambertMaterial color={0x8b3a3a} />
            </mesh>
            {teeth}
            {chimneys}
            {[-11, 11].map(i => (
                <mesh key={`pipe - ${i} `} position={[i, 6, 8.5]}>
                    <cylinderGeometry args={[0.5, 0.5, 12]} />
                    <meshLambertMaterial color={0x999999} />
                </mesh>
            ))}
            <mesh position={[0, 3, 8.1]}>
                <boxGeometry args={[6, 6, 0.3]} />
                <meshLambertMaterial color={0x333333} />
            </mesh>
            <mesh position={[0, 6.25, 8.1]}>
                <boxGeometry args={[6.4, 0.5, 0.4]} />
                <meshLambertMaterial color={0xffd700} />
            </mesh>
        </group>
    );
}

function Smoke({ x, y, z, j }) {
    const smokeRef = useRef();
    const baseY = 22;
    const speed = 0.04 + (j * 0.01);

    useFrame(() => {
        if (smokeRef.current) {
            smokeRef.current.position.y += speed * 0.5; // Adjusted speed for R3F mapping
            let heightDiff = smokeRef.current.position.y - baseY;
            const scaleVal = 1 + heightDiff * 0.12;
            smokeRef.current.scale.setScalar(scaleVal);
            smokeRef.current.material.opacity = Math.max(0, 0.8 - heightDiff * 0.08);

            if (heightDiff > 10) {
                smokeRef.current.position.y = baseY;
                smokeRef.current.scale.setScalar(1);
                smokeRef.current.material.opacity = 0.8;
            }
        }
    });

    return (
        <mesh ref={smokeRef} position={[x, y, z]}>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshLambertMaterial color={0x888888} transparent opacity={0.8} />
        </mesh>
    );
}
