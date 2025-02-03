// WorldMap.tsx
import React, { FC } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface WorldMapProps {
    mapName: string;
    // setMapObjects: React.Dispatch<THREE.Group<THREE.Object3DEventMap>>;
    currentGLTF: any;
    currentBuildings: Array<THREE.Mesh>;
}

const WorldMap: FC<WorldMapProps> = ({ mapName, currentGLTF, currentBuildings }) => {

    const { nodes } = currentGLTF;


    return (
        <>
            <RigidBody type="fixed" name="floor" colliders={"trimesh"} >
                {/* <mesh geometry={(nodes.walkable as THREE.Mesh).geometry} material={materials.walkable} /> */}
                <primitive object={nodes.walkable} />
            </RigidBody>
            {currentBuildings.map((building, index) => (
                <RigidBody key={index} type="fixed" name="wall" colliders="trimesh">
                    <mesh geometry={building.geometry} material={building.material} />
                </RigidBody>
            ))}
        </>
    );
};

export default WorldMap;
