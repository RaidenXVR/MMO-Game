// MapContext.tsx
import { useGLTF } from "@react-three/drei";
import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import * as THREE from "three";



interface MapContextType {
    currentMap: string;
    setCurrentMap: React.Dispatch<React.SetStateAction<string>>;
    currentGLTF: any;
    setCurrentGLTF: React.Dispatch<React.SetStateAction<any>>;
    currentBuildings: Array<THREE.Mesh>;
    setCurrentBuildings: React.Dispatch<React.SetStateAction<Array<THREE.Mesh>>>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentMap, setCurrentMap] = useState("kampus1v2"); // Default map name
    const gltf = useGLTF(`/models/maps/${currentMap}.glb`);
    const [currentGLTF, setCurrentGLTF] = useState(gltf);
    const [currentBuildings, setCurrentBuildings] = useState<Array<THREE.Mesh>>([]);
    useEffect(() => {
        const newGlTF = useGLTF(`/models/maps/${currentMap}.glb`);
        setCurrentGLTF(newGlTF);
        const buildings = []
        // setMapObjects(scene);
        for (const node in newGlTF.nodes) {
            if (node.includes("building")) {
                const building = new THREE.Mesh();
                building.geometry = (newGlTF.nodes[node] as THREE.Mesh).geometry;
                building.material = (newGlTF.materials["buildings"] as THREE.MeshBasicMaterial).clone();
                building.name = node;
                buildings.push(building);
            }
        }
        setCurrentBuildings(buildings);
    }, [currentMap]);


    return (
        <MapContext.Provider value={{ currentMap, setCurrentMap, currentGLTF, setCurrentGLTF, currentBuildings, setCurrentBuildings }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = (): MapContextType => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context;
};
