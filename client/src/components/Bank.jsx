import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { addObstacle, removeObstacle } from '../utils/collisionStore';
import { makeTextTexture } from './constants';

export function Bank({ x, z, rotationY = 0 }) {
    const bankRef = useRef();
    useEffect(() => {
        const node = bankRef.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const signTex = useMemo(() => new THREE.CanvasTexture(makeTextTexture("CITY BANK", "#ffd700", "#000000")), []);

    return (
        <group ref={bankRef} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[16, 0.6, 12]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[18, 0.3, 14]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
            <mesh position={[0, 4.6, -1]} castShadow>
                <boxGeometry args={[14, 8, 8]} />
                <meshLambertMaterial color={0xeeeeee} />
            </mesh>

            {[-4, 4].map(i => (
                <mesh key={`win-${i}`} position={[i, 4.6, -1]}>
                    <boxGeometry args={[2, 4, 8.2]} />
                    <meshLambertMaterial color={0x87CEFA} />
                </mesh>
            ))}

            {[-6, -3, 3, 6].map(i => (
                <mesh key={`pillar-${i}`} position={[i, 4.6, 4]} castShadow>
                    <cylinderGeometry args={[0.6, 0.6, 8, 32]} />
                    <meshLambertMaterial color={0xffffff} />
                </mesh>
            ))}

            <mesh position={[0, 10.6, 1.5]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[12, 4, 4]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>

            <mesh position={[0, 8, 4.5]}>
                <boxGeometry args={[8, 1.5, 0.4]} />
                <meshLambertMaterial attach="material-0" color={0xffd700} />
                <meshLambertMaterial attach="material-1" color={0xffd700} />
                <meshLambertMaterial attach="material-2" color={0xffd700} />
                <meshLambertMaterial attach="material-3" color={0xffd700} />
                <meshLambertMaterial attach="material-4" map={signTex} />
                <meshLambertMaterial attach="material-5" color={0xffd700} />
            </mesh>

            <mesh position={[0, 2.6, 3.1]}>
                <boxGeometry args={[3, 4, 0.2]} />
                <meshLambertMaterial color={0x87CEFA} />
            </mesh>

            {[-7, 7].map(i => (
                <mesh key={`bush-${i}`} position={[i, 1, 6]}>
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshLambertMaterial color={0x228b22} />
                </mesh>
            ))}
        </group>
    );
}
