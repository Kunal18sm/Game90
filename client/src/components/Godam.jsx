import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { addObstacle, removeObstacle } from '../utils/collisionStore';
import { makeTextTexture } from './constants';

export function Godam({ x, z, type, rotationY = 0 }) {
    const godamRef = useRef();
    useEffect(() => {
        const node = godamRef.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const w = 7.5, h = 4.5, d = 6, wallThick = 0.2;

    let signText = type === 'banana' ? "BANANA GODAM" : "CLOTHES GODAM";
    let signBg = type === 'banana' ? "#f39c12" : "#8e44ad";

    const signTex = useMemo(() => new THREE.CanvasTexture(makeTextTexture(signText, signBg, "#ffffff")), [signText, signBg]);

    const materials = useMemo(() => {
        return [
            <meshLambertMaterial attach="material-0" color={0x2c3e50} key="0" />,
            <meshLambertMaterial attach="material-1" color={0x2c3e50} key="1" />,
            <meshLambertMaterial attach="material-2" color={0x2c3e50} key="2" />,
            <meshLambertMaterial attach="material-3" color={0x2c3e50} key="3" />,
            <meshLambertMaterial attach="material-4" map={signTex} key="4" />,
            <meshLambertMaterial attach="material-5" color={0x2c3e50} key="5" />
        ];
    }, [signTex]);

    return (
        <group ref={godamRef} position={[x, 0, z]} rotation={[0, rotationY, 0]}>
            {/* Walls */}
            <mesh position={[0, h / 2, -d / 2 + wallThick / 2]} castShadow receiveShadow>
                <boxGeometry args={[w, h, wallThick]} />
                <meshLambertMaterial color={0x7f8c8d} />
            </mesh>
            <mesh position={[-w / 2 + wallThick / 2, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThick, h, d]} />
                <meshLambertMaterial color={0x7f8c8d} />
            </mesh>
            <mesh position={[w / 2 - wallThick / 2, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThick, h, d]} />
                <meshLambertMaterial color={0x7f8c8d} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, h - wallThick / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, wallThick, d]} />
                <meshLambertMaterial color={0x34495e} />
            </mesh>
            {/* Sign */}
            <mesh position={[0, h + 0.6, d / 2 - 0.1]}>
                <boxGeometry args={[w - 0.5, 1.2, 0.2]} />
                {materials}
            </mesh>

            {/* Interiors */}
            {type === 'banana' ? <BananaGodamContent wallThick={wallThick} /> : <ClothesGodamContent wallThick={wallThick} />}
        </group>
    );
}

function BananaGodamContent({ wallThick }) {
    const content = [];
    for (let i = -2; i <= 2; i += 2) {
        for (let j = -2; j <= 1; j += 1.5) {
            content.push(
                <mesh key={`crate-${i}-${j}`} position={[i, 0.6 + wallThick, j]} castShadow>
                    <boxGeometry args={[1.5, 1.2, 1.2]} />
                    <meshLambertMaterial color={0x8b5a2b} />
                </mesh>
            );

            for (let b = -0.5; b <= 0.5; b += 0.5) {
                content.push(
                    <mesh key={`ban-${i}-${j}-${b}`} rotation={[Math.PI / 2, 0, Math.abs((i * 3 + j * 7)) % 2]} position={[i + b, 1.3, j]}>
                        <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI]} />
                        <meshLambertMaterial color={0xffd700} />
                    </mesh>
                );
            }
        }
    }
    return <>{content}</>;
}

function ClothesGodamContent({ wallThick }) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const content = [];
    for (let i = -2.5; i <= 2.5; i += 1.5) {
        for (let j = -2; j <= 1; j += 1.5) {
            const stackH = 1.5 + (Math.abs(i * 3 + j * 5) % 3) * 0.5;
            const cIdx = Math.abs(i * 5 + j * 7) % colors.length;
            content.push(
                <mesh key={`box-${i}-${j}`} position={[i, stackH / 2 + wallThick, j]} castShadow>
                    <boxGeometry args={[1.2, stackH, 1.2]} />
                    <meshLambertMaterial color={colors[cIdx]} />
                </mesh>
            );
        }
    }
    return <>{content}</>;
}
