import React, { Suspense, useMemo } from 'react';
// import RPGGame from './Game';
import Scene from './Scene';
import './App.css';
import { Physics } from '@react-three/rapier';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';

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

      <Canvas className='App' shadows frameloop='demand'>

        <color attach={"background"} args={["#ececec"]} />
        <Suspense>
          <Physics gravity={[0, -4, 0]}>
            <Scene username={username} color={color} />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
};

export default App;

