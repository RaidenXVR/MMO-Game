import React, { Suspense, useMemo } from 'react';
// import RPGGame from './Game';
import Scene from './Scene';
import './App.css';
import { Physics } from '@react-three/rapier';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { MapProvider } from './components/MapContext';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  jump: 'jump',
  debug: 'debug',
}

interface AppProps {
  username: string
  color: string
}

const App: React.FC<AppProps> = ({ username, color }) => {

  const map = useMemo(() => [
    { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
    { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
    { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
    { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
    { name: Controls.jump, keys: ["Space"] },
    { name: Controls.debug, keys: ["KeyP"] },


  ], [])


  return (
    <KeyboardControls map={map}>
      <div id="coordinates-overlay" style={{
        position: 'fixed', top: "10px", left: '10px', color: 'white', padding: "8px 12px", backgroundColor: "#000000dd",
        borderRadius: '5px',
        fontSize: '14px',
        zIndex: 9999
      }}>
        <p id="x-coor"></p>
        <p id="y-coor"></p>
        <p id="z-coor"></p>
      </div>
      <div id='camera-overlay' style={{
        position: 'fixed', top: "10px", right: '10px', color: 'white', padding: "8px 12px", backgroundColor: "#000000dd",
        borderRadius: '5px',
        fontSize: '14px',
        zIndex: 9999
      }}>
        <p id="camera-x"></p>
        <p id="camera-y"></p>
        <p id="camera-z"></p>
        <p id='azimuth-angle'></p>
        <p id='polar-angle'></p>
      </div>
      <Canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }} shadows frameloop='demand'>

        <color attach={"background"} args={["#ececec"]} />
        <Suspense>
          <Physics gravity={[0, -4, 0]}>
            <MapProvider>
              <Scene username={username} color={color} />
            </MapProvider>
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls >
  );
};

export default App;

