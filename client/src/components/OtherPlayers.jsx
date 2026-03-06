import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useStore } from '../store';
import * as THREE from 'three';

function RemotePlayer({ player }) {
    const groupRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;

        // Smoothly interpolate position to exactly match what we receive from socket
        groupRef.current.position.lerp(new THREE.Vector3(player.x, player.y, player.z), 0.2);

        // Smooth rotation
        const currentRot = groupRef.current.rotation.y;
        const targetRot = player.rotationY;
        groupRef.current.rotation.y += (targetRot - currentRot) * 0.2;

        // Animate legs and arms if player is marked as moving
        if (player.animating) {
            const time = state.clock.elapsedTime * 15;
            if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.8;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(time) * 0.8;
            if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(time) * 0.8;
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 0.8;
        } else {
            if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
            if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        }
    });

    return (
        <group ref={groupRef} position={[player.x, player.y, player.z]} rotation={[0, player.rotationY, 0]} scale={[0.35, 0.35, 0.35]}>
            {/* Username Floating Tag */}
            <Text
                position={[0, 4, 0]}
                fontSize={0.8}
                color="white"
                outlineWidth={0.05}
                outlineColor="black"
                anchorX="center"
                anchorY="middle"
            >
                {player.username}
            </Text>

            {/* Head */}
            <mesh position={[0, 1.75, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshLambertMaterial color={0xffcc99} />
            </mesh>

            {/* Eyes & Smile */}
            <mesh position={[-0.2, 1.85, -0.41]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color={0x2f3542} />
            </mesh>
            <mesh position={[0.2, 1.85, -0.41]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color={0x2f3542} />
            </mesh>
            <mesh position={[0, 1.55, -0.41]}>
                <boxGeometry args={[0.2, 0.05, 0.1]} />
                <meshBasicMaterial color={0x2f3542} />
            </mesh>

            {/* Body */}
            <mesh position={[0, 0.85, 0]} castShadow>
                <boxGeometry args={[0.8, 1.0, 0.5]} />
                {/* Randomize shirt color somewhat or just use purple for remote players */}
                <meshLambertMaterial color={0x9b59b6} />
            </mesh>

            {/* Arms */}
            <group ref={leftArmRef} position={[-0.55, 1.25, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.8, 0.3]} />
                    <meshLambertMaterial color={0xffcc99} />
                </mesh>
            </group>
            <group ref={rightArmRef} position={[0.55, 1.25, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.8, 0.3]} />
                    <meshLambertMaterial color={0xffcc99} />
                </mesh>
            </group>

            {/* Legs */}
            <group ref={leftLegRef} position={[-0.2, 0.35, 0]}>
                <mesh position={[0, -0.35, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.7, 0.3]} />
                    <meshLambertMaterial color={0x2c3e50} />
                </mesh>
            </group>
            <group ref={rightLegRef} position={[0.2, 0.35, 0]}>
                <mesh position={[0, -0.35, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.7, 0.3]} />
                    <meshLambertMaterial color={0x2c3e50} />
                </mesh>
            </group>
        </group>
    );
}

export function OtherPlayers() {
    // We only access remotePlayers state once from Zustand setup,
    // to avoid tearing. We map over the object keys.
    const remotePlayers = useStore(state => state.remotePlayers);

    return (
        <group>
            {Object.values(remotePlayers).map(player => (
                <RemotePlayer key={player.id} player={player} />
            ))}
        </group>
    );
}
