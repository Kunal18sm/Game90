import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { addObstacle, removeObstacle } from '../utils/collisionStore';
import { makeTextTexture } from './constants';

export function Shop({ x, z, type, rotationY = 0 }) {
    const shopRef = useRef();
    useEffect(() => {
        const node = shopRef.current;
        if (node) addObstacle(node);
        return () => { if (node) removeObstacle(node); };
    }, []);

    const width = 4, height = 3.5, depth = 4, wallThick = 0.2;

    let awningColor, shopNameText;
    if (type === 'banana') { awningColor = 0xffeb3b; shopNameText = "BANANA SHOP"; }
    else if (type === 'fish') { awningColor = 0x00bcd4; shopNameText = "FISH SHOP"; }
    else { awningColor = 0xe91e63; shopNameText = "CLOTHES SHOP"; }

    const signTex = useMemo(() => {
        const hexColorString = "#" + awningColor.toString(16).padStart(6, '0');
        const textColorString = type === 'banana' ? "#000000" : "#ffffff";
        return new THREE.CanvasTexture(makeTextTexture(shopNameText, hexColorString, textColorString));
    }, [type, awningColor, shopNameText]);

    const materials = useMemo(() => {
        return [
            <meshLambertMaterial attach="material-0" color={awningColor} key="0" />,
            <meshLambertMaterial attach="material-1" color={awningColor} key="1" />,
            <meshLambertMaterial attach="material-2" color={awningColor} key="2" />,
            <meshLambertMaterial attach="material-3" color={awningColor} key="3" />,
            <meshLambertMaterial attach="material-4" map={signTex} key="4" />,
            <meshLambertMaterial attach="material-5" color={awningColor} key="5" />
        ];
    }, [awningColor, signTex]);

    return (
        <group ref={shopRef} position={[x, 0, z]} rotation={[0, rotationY, 0]} userData={{ shopType: type }}>
            {/* Walls */}
            <mesh position={[0, height / 2, -depth / 2 + wallThick / 2]}>
                <boxGeometry args={[width, height, wallThick]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
            <mesh position={[-width / 2 + wallThick / 2, height / 2, 0]}>
                <boxGeometry args={[wallThick, height, depth]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
            <mesh position={[width / 2 - wallThick / 2, height / 2, 0]}>
                <boxGeometry args={[wallThick, height, depth]} />
                <meshLambertMaterial color={0xffffff} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, height - wallThick / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, wallThick, depth]} />
                <meshLambertMaterial color={0x95a5a6} />
            </mesh>
            {/* Awning */}
            <mesh position={[0, height - 0.2, depth / 2 + 1]} rotation={[-Math.PI / 8, 0, 0]}>
                <boxGeometry args={[width + 0.4, 0.2, 2.5]} />
                <meshLambertMaterial color={awningColor} />
            </mesh>
            {/* Sign */}
            <mesh position={[0, height + 0.5, depth / 2 + 0.1]}>
                <boxGeometry args={[width, 1, 0.2]} />
                {materials}
            </mesh>

            {/* Interiors */}
            {(type === 'banana' || type === 'fish') && (
                <mesh position={[0, 0.6, 1]} castShadow>
                    <boxGeometry args={[width - 0.5, 1.2, 1.2]} />
                    <meshLambertMaterial color={0x8b5a2b} />
                </mesh>
            )}

            {type === 'banana' && <BananaShopContent />}
            {type === 'fish' && <FishShopContent width={width} />}
            {type === 'clothes' && <ClothesShopContent width={width} height={height} />}
        </group>
    );
}

function BananaShopContent() {
    const bunches = [];
    let bIndex = 0;
    for (let i = -1.2; i <= 1.2; i += 0.8) {
        const bananas = [];
        for (let j = 0; j < 3; j++) {
            bananas.push(
                <mesh key={`b-${j}`} rotation={[Math.PI / 2, 0, (j - 1) * 0.3]} position={[0, 0.05 * j, 0]} castShadow>
                    <torusGeometry args={[0.2, 0.06, 8, 16, Math.PI]} />
                    <meshLambertMaterial color={0xffd700} />
                </mesh>
            );
        }
        bunches.push(
            <group key={`bunch-${i}`} position={[i, 1.3, 1]} rotation={[Math.PI / 4, (bIndex % 3) * 0.2, 0]}>
                {bananas}
            </group>
        );
        bIndex++;
    }
    return <>{bunches}</>;
}

function FishShopContent({ width }) {
    const fishes = [];
    let fIndex = 0;
    for (let i = -1.2; i <= 1.2; i += 0.6) {
        fishes.push(
            <group key={`fish-${i}`} position={[i, 1.45, 1]} rotation={[-Math.PI / 2, (fIndex % 4) * (Math.PI / 4), 0]}>
                <mesh scale={[1.5, 0.8, 0.3]} castShadow>
                    <sphereGeometry args={[0.25, 16, 8]} />
                    <meshLambertMaterial color={0x99ccff} />
                </mesh>
                <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.3]} castShadow>
                    <coneGeometry args={[0.15, 0.3, 3]} />
                    <meshLambertMaterial color={0x77aaff} />
                </mesh>
            </group>
        );
        fIndex++;
    }

    return (
        <>
            <mesh position={[0, 1.3, 1]}>
                <boxGeometry args={[width - 0.6, 0.2, 1]} />
                <meshLambertMaterial color={0xe0ffff} />
            </mesh>
            {fishes}
        </>
    );
}

function ClothesShopContent({ width, height }) {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff88ff, 0xffa500];
    const racks = [0, -1.2].map((rackZ, rIdx) => {
        const clothes = [];
        let cIndex = 0;
        for (let i = -1.2; i <= 1.2; i += 0.6) {
            const colToUse = colors[(rIdx * 5 + cIndex) % colors.length];
            const isShirt = (cIndex + rIdx) % 2 === 0;

            clothes.push(
                <group key={`cloth-${rIdx}-${i}`} position={[i, height - 1.2, rackZ]}>
                    {isShirt ? (
                        <>
                            <mesh position={[0, -0.35, 0]}>
                                <boxGeometry args={[0.5, 0.7, 0.1]} />
                                <meshLambertMaterial color={colToUse} />
                            </mesh>
                            <mesh position={[0, -0.12, 0]}>
                                <boxGeometry args={[0.9, 0.25, 0.1]} />
                                <meshLambertMaterial color={colToUse} />
                            </mesh>
                        </>
                    ) : (
                        <>
                            <mesh position={[0, -0.1, 0]}>
                                <boxGeometry args={[0.45, 0.2, 0.1]} />
                                <meshLambertMaterial color={colToUse} />
                            </mesh>
                            <mesh position={[-0.135, -0.45, 0]}>
                                <boxGeometry args={[0.18, 0.7, 0.1]} />
                                <meshLambertMaterial color={colToUse} />
                            </mesh>
                            <mesh position={[0.135, -0.45, 0]}>
                                <boxGeometry args={[0.18, 0.7, 0.1]} />
                                <meshLambertMaterial color={colToUse} />
                            </mesh>
                        </>
                    )}
                </group>
            );
            cIndex++;
        }

        return (
            <group key={`rack-${rackZ}`}>
                <mesh position={[0, height - 1.2, rackZ]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, width - 1]} />
                    <meshLambertMaterial color={0x555555} />
                </mesh>
                {clothes}
            </group>
        );
    });

    return (
        <>
            {racks}
            <mesh position={[0, 0.4, 1.2]}>
                <boxGeometry args={[2, 0.8, 1]} />
                <meshLambertMaterial color={0x8b5a2b} />
            </mesh>
            {[0, 1, 2].map(k => (
                <React.Fragment key={`stack-${k}`}>
                    <mesh position={[-0.5, 0.85 + k * 0.1, 1.2]}>
                        <boxGeometry args={[0.6, 0.1, 0.6]} />
                        <meshLambertMaterial color={0x00bcd4} />
                    </mesh>
                    <mesh position={[0.5, 0.85 + k * 0.1, 1.2]}>
                        <boxGeometry args={[0.6, 0.1, 0.6]} />
                        <meshLambertMaterial color={0xff69b4} />
                    </mesh>
                </React.Fragment>
            ))}
        </>
    );
}
