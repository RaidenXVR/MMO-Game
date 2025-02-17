import { OrbitControls, useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { RapierRigidBody, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Controls } from "../App";
import { useFrame, useThree } from "@react-three/fiber";
import { Socket } from "socket.io-client";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
// import { useMap } from "react-use";

interface PlayerProperties {
    socket: Socket,
    mapGltf: any,
    currentBuildings: Array<THREE.Mesh>,
    username: string,
    color: string,
    last_position?: { x: number, y: number, z: number }
}

interface CoordinateProperties {
    x: number,
    y: number,
    z: number
}

const Player: React.FC<PlayerProperties> = ({ socket, mapGltf, currentBuildings, username, color }) => {

    // Player's attributes
    const cube = useRef<RapierRigidBody | null>(null);
    const isOnFloor = useRef(true);
    const raycastHelper = useRef<THREE.ArrowHelper | null>(null);
    const [azimuthAngle, setAzimuthAngle] = useState<number>(0.79);



    // For camera control
    const { rapier, world } = useRapier();
    const { camera } = useThree()
    const controlsRef = useRef<OrbitControlsImpl>(null);

    // For player's model
    const gltf = useGLTF('/models/player.glb');
    const { materials, animations } = gltf;
    const group = useRef(gltf.scene);
    const mats = materials.Color1 as THREE.MeshStandardMaterial
    mats.color = new THREE.Color(color)

    //tests

    // to play player's animation
    const { actions } = useAnimations(animations, group)
    useEffect(() => {
        actions.idle?.play();

    }, [actions]);

    // To lock camera rotations
    useEffect(() => {
        if (controlsRef.current) {
            const controls = controlsRef.current;
            const playerPosition = cube.current?.translation();

            // Lock the OrbitControls to only rotate around the Y-axis
            controls.minPolarAngle = Math.PI / 3; // Lock vertical angle
            controls.maxPolarAngle = Math.PI / 5; // Lock vertical angle
            controls.enablePan = false; // Disable panning
            controls.minAzimuthAngle = -Infinity; // Allow full rotation
            controls.maxAzimuthAngle = Infinity; // Allow full rotation
            controls.enableZoom = true;

            // Update the target to follow the player's position
            if (playerPosition) {
                controls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);
                camera.position.set(playerPosition.x + 10, playerPosition.y + 10, playerPosition.z + 10)
            }
            controls.update(); // Required to apply the new target


        }
    }, []);

    useEffect(() => {
        const controls = controlsRef.current;
        const handleChange = () => {
            if (controls) {
                if (Math.abs(controls.getAzimuthalAngle() - azimuthAngle) > 0.01) {
                    const angle = controls.getAzimuthalAngle();
                    setAzimuthAngle(angle);
                    console.log("azimuth set: ", azimuthAngle)
                }
                // console.log("azimuth: ", controls.getAzimuthalAngle(), azimuthAngle)

            };

        }

        // Attach the change event listener
        controls?.addEventListener("change", handleChange);

        return () => {
            // Cleanup the event listener
            controls?.removeEventListener("change", handleChange);
        };
    }, [azimuthAngle]);

    // Handle player controls
    // To jump. Not Yet Used.
    const jump = () => {
        if (isOnFloor.current) {
            cube.current?.applyImpulse({ x: 0, y: 10, z: 0 }, true);
            isOnFloor.current = false;
        }
    };
    // Controls, defined in App.tsx
    const jumpPressed = useKeyboardControls((state) => state[Controls.jump]);
    const forwardPressed = useKeyboardControls((state) => state[Controls.forward]);
    const backPressed = useKeyboardControls((state) => state[Controls.back]);
    const leftPressed = useKeyboardControls((state) => state[Controls.left]);
    const rightPressed = useKeyboardControls((state) => state[Controls.right]);
    const debugPressed = useKeyboardControls((state) => state[Controls.debug]);

    const handleMovement = () => {
        if (!isOnFloor.current) {
            return;
        }



        // Calculate movement direction
        const direction = new THREE.Vector3(
            (rightPressed ? 1 : 0) - (leftPressed ? 1 : 0),
            0,
            (backPressed ? 1 : 0) - (forwardPressed ? 1 : 0)
        );
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), azimuthAngle);


        // Normalize direction to ensure consistent speed
        if (direction.length() > 0) {
            direction.normalize();
            actions.idle?.stop();
            actions.walk?.play();



            // Update position
            const currentPosition = cube.current?.translation();
            if (currentPosition) {
                const nextPosition = new THREE.Vector3(
                    currentPosition.x + direction.x * 0.2,
                    currentPosition.y + direction.y * 0.2,
                    currentPosition.z + direction.z * 0.2
                );
                const ray = new rapier.Ray(currentPosition, new THREE.Vector3(0, -1, 0));
                const hit = world.castRay(ray, 10, true);


                if (hit) {
                    const hitPoint = ray.pointAt(hit.timeOfImpact);
                    nextPosition.y = hitPoint.y + 1
                }
                const wallRay = new rapier.Ray(currentPosition, direction)
                const hitWall = world.castRay(wallRay, 1, true)

                if (!hitWall) {
                    cube.current?.setTranslation(nextPosition, false);
                }
                const overlay = document.getElementById("coordinates-overlay");
                if (overlay) {
                    const x = overlay.children[0]
                    const y = overlay.children[1]
                    const z = overlay.children[2]

                    x.textContent = `x: ${currentPosition.x.toFixed(2)}`;
                    y.textContent = `y: ${currentPosition.y.toFixed(2)}`;
                    z.textContent = `z: ${currentPosition.z.toFixed(2)}`;
                }

            }


            // Update rotation to face movement direction
            const targetQuaternion = new THREE.Quaternion();
            const forwardVector = new THREE.Vector3(0, 0, -1); // Default forward vector
            targetQuaternion.setFromUnitVectors(forwardVector, new THREE.Vector3(-direction.z, direction.y, direction.x));

            const currentRotation = cube.current?.rotation();
            if (currentRotation) {
                const currentQuaternion = new THREE.Quaternion(
                    currentRotation.x,
                    currentRotation.y,
                    currentRotation.z,
                    currentRotation.w
                );

                // Smoothly interpolate the rotation using slerp
                currentQuaternion.slerp(targetQuaternion, 0.1);
                cube.current?.setNextKinematicRotation(currentQuaternion);
            }

            //camera
            if (controlsRef.current) {

                const controls = controlsRef.current;
                const playerPosition = cube.current?.translation();

                // Update the target to follow the player's position
                if (playerPosition) {
                    // Update the camera's position to follow the player
                    camera.position.setFromSphericalCoords(16, 0.9, azimuthAngle)
                    camera.position.add(playerPosition)

                    // Update the camera's target to the player's position
                    controls.target.set(playerPosition.x, playerPosition.y, playerPosition.z);

                }
                controls.update(); // Required to apply the new target
            }
        }
        else {
            actions.walk?.stop();
            actions.idle?.play(); // Play idle animation when not moving
        }
    };


    useFrame(() => {
        if (jumpPressed) {
            console.log('jump');
            jump();
        }
        if (debugPressed) {
            socket.emit("debug");

        }
        handleMovement();
        opacityHandler();
        checkCameraCoordinates();
    });

    const checkCameraCoordinates = () => {
        const cameraPosition = camera.position;
        const overlay = document.getElementById("camera-overlay");
        if (overlay) {
            const x = overlay.children[0]
            const y = overlay.children[1]
            const z = overlay.children[2]
            const azimuth = overlay.children[3]
            const polar = overlay.children[4]

            x.textContent = `x: ${cameraPosition.x.toFixed(2)}`;
            y.textContent = `y: ${cameraPosition.y.toFixed(2)}`;
            z.textContent = `z: ${cameraPosition.z.toFixed(2)}`;
            const aAngle = controlsRef.current?.getAzimuthalAngle();
            if (aAngle) {
                azimuth.textContent = `azimuth: ${aAngle.toFixed(2)}`;

            } polar.textContent = `polar: ${controlsRef.current?.getPolarAngle().toFixed(2)}`;

        }

    }

    const opacityHandler = () => {

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        raycastHelper.current?.setDirection(raycaster.ray.direction);
        raycastHelper.current?.setLength(30);
        raycastHelper.current?.position.set(raycaster.ray.origin.x, raycaster.ray.origin.y, raycaster.ray.origin.z);

        const intersects = raycaster.intersectObjects(currentBuildings, true);
        if (intersects.length > 0) {
            // console.log("intersects: ", intersects)
            // console.log("camera pos: ", camera.position)
            const object = intersects[0].object as THREE.Mesh
            const material = object.material as THREE.MeshStandardMaterial;
            material.opacity = 0.3;
            material.transparent = true;
            // console.log("object", object)
            currentBuildings.forEach((building) => {
                if (building.uuid !== object.uuid) {
                    const mat = building.material as THREE.MeshStandardMaterial;
                    mat.opacity = 1;
                    mat.transparent = false;
                }
            })
        }
        else {
            currentBuildings.forEach((building) => {
                const mat = building.material as THREE.MeshStandardMaterial;
                mat.opacity = 1;
                mat.transparent = false;

            })
        }

    }
    useEffect(() => {
        const updateCoor = () => {
            socket.emit("move", {
                id: username,
                x: cube.current?.translation().x,
                y: cube.current?.translation().y,
                z: cube.current?.translation().z,
                rot_x: cube.current?.rotation().x,
                rot_y: cube.current?.rotation().y,
                rot_z: cube.current?.rotation().z,
                rot_w: cube.current?.rotation().w,
                color: color
            })
        }

        const updateCoorInterval = setInterval(updateCoor, 80);

        return () => clearInterval(updateCoorInterval);
    }, []);

    useEffect(() => {
        socket.on("last_position", ({ x, y, z, rot_x, rot_y, rot_z, rot_w, color }) => {
            cube.current?.setNextKinematicTranslation(new THREE.Vector3(x, y, z));
            cube.current?.setNextKinematicRotation(new THREE.Quaternion(rot_x, rot_y, rot_z, rot_w));
        })
    })

    return (<>
        {/* Player */}
        < RigidBody ref={cube}
            position={[-28, 2.5, -78]}
            gravityScale={0}
            rotation={[0, 0, 0]}
            type="kinematicPosition"
            colliders={"cuboid"}

        >
            <primitive object={group.current} scale={[0.3, 0.3, 0.3]} />
        </RigidBody >
        <OrbitControls ref={controlsRef} />
        <arrowHelper ref={raycastHelper} />
    </>
    );
}

export default Player;