// Map.tsx
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { MeshBasicMaterial } from "three";

const WorldMap = () => {

    const gltf = useGLTF('/assets/models/maps/jalanv2.glb')
    const { materials } = gltf
    const mats = materials.transparent_wall as MeshBasicMaterial
    mats.transparent = true
    mats.opacity = 0
    console.log(materials.transparent_wall)
    return (
        <RigidBody type="fixed" name="floor" position={[0, 0, 0]} colliders={"trimesh"}>
            <primitive object={gltf.scene} scale={[1, 1, 1]} />
        </RigidBody>
    );
};

export default WorldMap;
