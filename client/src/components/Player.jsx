import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { walkables, obstacles } from '../utils/collisionStore';
import { useStore } from '../store';

function useKeyboard() {
    const keys = useRef({ w: false, a: false, s: false, d: false });

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || e.key === 'ArrowUp') keys.current.w = true;
            if (key === 's' || e.key === 'ArrowDown') keys.current.s = true;
            if (key === 'a' || e.key === 'ArrowLeft') keys.current.a = true;
            if (key === 'd' || e.key === 'ArrowRight') keys.current.d = true;
        };
        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || e.key === 'ArrowUp') keys.current.w = false;
            if (key === 's' || e.key === 'ArrowDown') keys.current.s = false;
            if (key === 'a' || e.key === 'ArrowLeft') keys.current.a = false;
            if (key === 'd' || e.key === 'ArrowRight') keys.current.d = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keys;
}

export function Player() {
    const groupRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();

    const keysRef = useKeyboard();
    const { camera } = useThree();
    const user = useStore(state => state.user);

    useEffect(() => {
        if (!groupRef.current || !user) return;

        groupRef.current.position.set(
            user.position?.x ?? 0,
            user.position?.y ?? 0,
            user.position?.z ?? 15
        );
        groupRef.current.rotation.y = user.rotationY ?? 0;
    }, [user]);

    // Persist raycasters to avoid recreating them 60 times a second
    const raycasterFwd = useRef(new THREE.Raycaster()).current;
    const raycasterDown = useRef(new THREE.Raycaster()).current;

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const keys = keysRef.current;
        const currentEnergy = useStore.getState().energy;
        const setActiveShopPanel = useStore.getState().setActiveShopPanel;
        const socket = useStore.getState().socket;

        const playerSpeed = currentEnergy > 0 ? 0.08 * 60 : 0.02 * 60; // Slower when exhausted
        const rotationSpeed = currentEnergy > 0 ? 0.03 * 60 : 0.01 * 60; // Increased rotation speed slightly for smoother turning feeling

        let isMoving = false;
        let moveZ = 0;
        let rotationChanged = false;

        if (keys.w) moveZ = -playerSpeed * delta;
        if (keys.s) moveZ = playerSpeed * delta;
        if (keys.a) { groupRef.current.rotation.y += rotationSpeed * delta; rotationChanged = true; }
        if (keys.d) { groupRef.current.rotation.y -= rotationSpeed * delta; rotationChanged = true; }

        // Collision Detection Forward
        if (moveZ !== 0) {
            const dir = new THREE.Vector3(0, 0, moveZ < 0 ? -1 : 1).applyQuaternion(groupRef.current.quaternion).normalize();
            const rayOrigin = groupRef.current.position.clone();
            rayOrigin.y += 0.5;

            raycasterFwd.set(rayOrigin, dir);
            raycasterFwd.near = 0;
            raycasterFwd.far = 1.0;

            const fwdIntersects = raycasterFwd.intersectObjects(obstacles, true);

            if (fwdIntersects.length === 0) {
                groupRef.current.translateZ(moveZ);
                isMoving = true;
            } else {
                // We hit something! Check if it's a shop
                const hitObj = fwdIntersects[0].object;
                // Traverse up to find the group with userData
                let currentObj = hitObj;
                let foundShopType = null;

                while (currentObj) {
                    if (currentObj.userData && currentObj.userData.shopType) {
                        foundShopType = currentObj.userData.shopType;
                        break;
                    }
                    currentObj = currentObj.parent;
                }

                if (foundShopType) {
                    setActiveShopPanel(foundShopType);
                }
            }
        }

        // Height Adjustment / Walkables collision (keeps feet on ground)
        const rayOriginDown = new THREE.Vector3(groupRef.current.position.x, groupRef.current.position.y + 10, groupRef.current.position.z);
        raycasterDown.set(rayOriginDown, new THREE.Vector3(0, -1, 0));
        const downIntersects = raycasterDown.intersectObjects(walkables, true);

        if (downIntersects.length > 0) {
            // Adjust 0.1 y-offset to exactly align the bottom of the legs with the ground mesh
            groupRef.current.position.y += (downIntersects[0].point.y + 0.1 - groupRef.current.position.y) * 0.2;
        } else {
            groupRef.current.position.y += (0.1 - groupRef.current.position.y) * 0.2;
        }

        // Exact Boundaries
        if (groupRef.current.position.x > 165) groupRef.current.position.x = 165;
        if (groupRef.current.position.x < -165) groupRef.current.position.x = -165;
        if (groupRef.current.position.z > 165) groupRef.current.position.z = 165;
        if (groupRef.current.position.z < -165) groupRef.current.position.z = -165;

        // Walking Animation
        if (isMoving) {
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

        // Camera Follow logic - smoother tracking behind the player
        if (keys.w || keys.s || keys.a || keys.d) {
            // Calculate the ideal position behind and slightly above the player
            let idealOffset = new THREE.Vector3(0, 3.5, 8);
            idealOffset.applyQuaternion(groupRef.current.quaternion);
            idealOffset.add(groupRef.current.position);

            // Lerp camera position smoothly
            camera.position.lerp(idealOffset, 2.5 * delta);
        }

        // Update OrbitControls target smoothly to look slightly ahead of the player
        if (state.controls) {
            const targetPos = groupRef.current.position.clone();
            targetPos.y += 1.5;

            // Lerp the orbit target instead of snapping it instantly to prevent jerking
            state.controls.target.lerp(targetPos, 4 * delta);
            state.controls.update(); // Force control update to prevent framing conflict
        }

        // Broadcast Movement to Server if socket exists and position/rotation changed
        if (socket && (isMoving || rotationChanged)) {
            socket.emit('player_move', {
                x: groupRef.current.position.x,
                y: groupRef.current.position.y,
                z: groupRef.current.position.z,
                rotationY: groupRef.current.rotation.y,
                animating: isMoving
            });
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 15]} scale={[0.35, 0.35, 0.35]}>
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
                <meshLambertMaterial color={0xff4757} />
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
                    <meshLambertMaterial color={0x1e90ff} />
                </mesh>
            </group>
            <group ref={rightLegRef} position={[0.2, 0.35, 0]}>
                <mesh position={[0, -0.35, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.7, 0.3]} />
                    <meshLambertMaterial color={0x1e90ff} />
                </mesh>
            </group>
        </group>
    );
}
