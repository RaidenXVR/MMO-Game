import { Box, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { FC, forwardRef, RefObject, useEffect, useRef } from "react";
import { Color } from "three";
import * as THREE from "three";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'



interface OtherPlayerProperties {
    id: string;
    color: Color;
    ref: RapierRigidBody | null
}

const OtherPlayer = forwardRef<RapierRigidBody, OtherPlayerProperties>(({ id, color }, ref) => {
    const gltf = useGLTF('/assets/models/otherPlayer.glb');
    const { nodes, materials } = gltf;
    const mats = materials.Color1.clone() as THREE.MeshStandardMaterial
    mats.color = new Color(color)



    useEffect(() => {

    }, []);

    // console.log("cloned scene: ", clonedScene);

    return (
        <>
            {/* Other Players */}

            <RigidBody
                key={id}
                gravityScale={1}
                ref={ref}
                type="kinematicPosition"
                collisionGroups={0b0010}
                scale={[0.3, 0.3, 0.3]}

            >
                {/* <primitive  object={clonedScene} scale={[0.3, 0.3, 0.3]} /> */}
                <mesh geometry={(nodes.Object_0002 as THREE.Mesh).geometry} material={mats} />
                <mesh geometry={(nodes.Object_0002_1 as THREE.Mesh).geometry} material={materials.Color2} />
                <mesh geometry={(nodes.Object_0002_2 as THREE.Mesh).geometry} material={materials.Color3} />



            </RigidBody>

        </>
    );
}
)

export default OtherPlayer;