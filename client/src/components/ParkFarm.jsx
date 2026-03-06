import React, { useRef, useEffect } from 'react';
import { addObstacle, removeObstacle } from '../utils/collisionStore';
import { Tree } from './Structures';

export function Farm({ x, z }) {
    const farmRef = useRef();

    const fence1Ref = useRef(), fence2Ref = useRef(), fence3Ref = useRef(), fence4Ref = useRef();

    useEffect(() => {
        [fence1Ref, fence2Ref, fence3Ref, fence4Ref].forEach(ref => {
            if (ref.current) addObstacle(ref.current);
        });
        return () => {
            [fence1Ref, fence2Ref, fence3Ref, fence4Ref].forEach(ref => {
                if (ref.current) removeObstacle(ref.current);
            });
        }
    }, []);

    const size = 14;
    const plants = [];
    for (let cx = -6; cx <= 6; cx += 0.8) {
        for (let cz = -6; cz <= 6; cz += 0.8) {
            const pHeight = 0.8 + ((Math.abs(cx * 7) + Math.abs(cz * 3)) % 4) * 0.15;
            plants.push(
                <mesh key={`plant-${cx}-${cz}`} position={[cx, 0.3, cz]} scale={[1, pHeight, 1]} castShadow>
                    <coneGeometry args={[0.2, 0.6, 5]} />
                    <meshLambertMaterial color={0x32cd32} />
                </mesh>
            );
        }
    }

    return (
        <group ref={farmRef} position={[x, 0, z]}>
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <boxGeometry args={[size, 0.1, size]} />
                <meshLambertMaterial color={0x3d2314} />
            </mesh>

            {plants}

            <mesh ref={fence1Ref} position={[-size / 2, 0.25, 0]}>
                <boxGeometry args={[0.2, 0.5, size]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
            <mesh ref={fence2Ref} position={[size / 2, 0.25, 0]}>
                <boxGeometry args={[0.2, 0.5, size]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
            <mesh ref={fence3Ref} position={[0, 0.25, -size / 2]}>
                <boxGeometry args={[size, 0.5, 0.2]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
            <mesh ref={fence4Ref} position={[0, 0.25, size / 2]}>
                <boxGeometry args={[size, 0.5, 0.2]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
        </group>
    );
}

export function Park({ x, z }) {
    const fountRef = useRef();
    useEffect(() => {
        const node = fountRef.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const treePositions = [[-4, -4], [4, -4], [-4, 4], [4, 4]];

    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[14, 0.1, 14]} />
                <meshLambertMaterial color={0x4caf50} />
            </mesh>

            <mesh ref={fountRef} position={[0, 0.2, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.4, 16]} />
                <meshLambertMaterial color={0x95a5a6} />
            </mesh>

            {treePositions.map((pos, idx) => (
                <Tree key={`tree-${idx}`} x={pos[0]} z={pos[1]} />
            ))}
        </group>
    );
}
