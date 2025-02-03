
import { invalidate, useFrame, } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Color, Quaternion } from "three";
import { getSocket } from "./Socket";
import React from "react";
import Player from "./components/Player";
import OtherPlayer from "./components/OtherPlayer";
import WorldMap from "./components/Map";
import { useMap } from "./components/MapContext";



interface SceneProps {
    username: string
    color: string
}

interface PlayerProps {
    id: string;
    color: Color;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number, w: number };
    ref: React.RefObject<RapierRigidBody>;
    target_position?: { x: number; y: number; z: number };
}

export const Scene: React.FC<SceneProps> = ({ username, color }) => {
    const socket = getSocket();
    const [otherPlayers, setOtherPlayers] = useState<PlayerProps[]>([]);
    const { currentMap, currentGLTF, currentBuildings } = useMap();



    useEffect(() => {
        socket.connect();
    }, []);
    const timeRef = useRef(0);
    const canSend = useRef(false);

    const addPlayer = (id: string,
        position: { x: number; y: number; z: number },
        rotation: { x: number; y: number; z: number, w: number },
        color: Color) => {
        const newPlayer: PlayerProps = {
            id,
            color,
            position,
            rotation,
            ref: React.createRef<RapierRigidBody>(),
            target_position: position,
        };
        newPlayer.ref.current?.setTranslation(position, true);
        console.log("new player added: ", newPlayer.id);
        setOtherPlayers((prev) => [...prev, newPlayer]);
    };

    // const removePlayer = (id: string) => {
    //     setOtherPlayers((prev) => prev.filter((player) => player.id !== id));
    // };

    const updatePlayerPosition = (id: string,
        position: { x: number; y: number; z: number },
        rotation: { x: number; y: number; z: number, w: number }

    ) => {
        setOtherPlayers((prev) =>
            prev.map((player) =>
                player.id === id ? { ...player, position, rotation } : player
            )
        );
    };

    useFrame((_state, delta) => {
        timeRef.current += delta;

        if (timeRef.current >= 0.5) {
            canSend.current = true;
            timeRef.current = 0;
        }
        else {
            canSend.current = false;
        }

    });

    useEffect(() => {
        // When connected, set player ID
        socket.on("connect", () => {
            console.log("Connected with ID:", username);

            // Send login event
            socket.emit("login", { id: username, x: 2.5, y: 4, z: 0, color: color }); // Use the correct ID

        });

        socket.on("existing_players", ({ existingPlayers }) => {
            existingPlayers.forEach((player: {
                id: string; x: number; y: number; z: number, rot_x: number; rot_y: number; rot_z: number, rot_w: number, color: Color
            }) => {
                addPlayer(player.id,
                    { x: player.x, y: player.y, z: player.z },
                    { x: player.rot_x, y: player.rot_y, z: player.rot_z, w: player.rot_w },
                    player.color);
            });
        })

        // Listen for other players' movements
        socket.on("player_moved", ({ id, x, y, z, rot_x, rot_y, rot_z, rot_w }) => {
            updatePlayerPosition(id, { x, y, z }, { x: rot_x, y: rot_y, z: rot_z, w: rot_w });
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        socket.on('new_player', ({ id, x, y, z, rot_x, rot_y, rot_z, rot_w, color }) => {
            if (id !== username) {
                addPlayer(id, { x: x, y: y, z: z }, { x: rot_x, y: rot_y, z: rot_z, w: rot_w }, color);
            }
            console.log(`new player arrived: ${id}`);

        });

        socket.on("player_disconnected", ({ id }) => {
            setOtherPlayers((prev) => prev.filter((player) => player.id !== id));
            console.log(`Player ${id} disconnected`);
        });

        return () => {
            // Cleanup event listeners
            socket.off("connect");
            socket.off("existing_players");
            socket.off("new_player");
            socket.off("player_disconnected");
            socket.off("player_moved");
        };
    }, [socket, username]);

    const interpolatePosition = (current: { x: number; y: number; z: number }, target: { x: number; y: number; z: number }, alpha: number) => {
        return {
            x: current.x + (target.x - current.x) * alpha,
            y: current.y + (target.y - current.y) * alpha,
            z: current.z + (target.z - current.z) * alpha,
        };
    };
    const interpolateQuaternion = (
        current: Quaternion,
        target: Quaternion,
        alpha: number
    ): Quaternion => {
        // Create a new quaternion to store the result
        const result = new Quaternion();
        result.copy(current).slerp(target, alpha); // Perform spherical linear interpolation (slerp)
        return result;
    };
    // Smoothly interpolate other players' positions
    useFrame(() => {
        otherPlayers.forEach((player) => {
            if (player.ref.current) {
                if (player.ref.current.translation() !== undefined) {
                    const interpolatedPosition = interpolatePosition(
                        player.ref.current.translation(),
                        player.position, // Update this based on server data
                        0.1 // Adjust smoothing factor
                    );
                    const interpolatedQuaternion = interpolateQuaternion(
                        player.ref.current.rotation() as Quaternion,
                        new Quaternion(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w),
                        0.1)
                    player.ref.current.setNextKinematicTranslation(interpolatedPosition);
                    player.ref.current.setNextKinematicRotation(interpolatedQuaternion)
                }
                else {
                    player.ref.current.setNextKinematicTranslation(player.position);
                    player.ref.current.setNextKinematicRotation(new Quaternion(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w))
                }
            }
        });
    });

    // set limit fps
    useEffect(() => {
        let lastTime = 0;
        const desiredFPS = 60;
        const frameDuration = 1000 / desiredFPS;
        let animationFrameId: number;

        const render = () => {
            const now = performance.now();
            const deltaTime = now - lastTime;

            if (deltaTime >= frameDuration) {
                lastTime = now;
                // Trigger render
                invalidate();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);


    return (
        <>
            <ambientLight intensity={0.5} shadow={Color.NAMES.beige} />
            <directionalLight position={[-10, 10, 0]} intensity={0.4} />
            {/* <OrbitControls /> */}

            <Player socket={socket} mapGltf={currentGLTF} currentBuildings={currentBuildings} username={username} color={color} />
            {/* Other Players */}
            {otherPlayers.map((player) => (
                <OtherPlayer key={player.id} id={player.id} color={player.color} ref={player.ref} />
            ))}

            {/* Floor / Map */}
            <WorldMap mapName={currentMap} currentBuildings={currentBuildings} currentGLTF={currentGLTF} />
        </>
    )
}

export default Scene;