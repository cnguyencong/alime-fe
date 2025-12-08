import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import './App.css';

function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Experience />
      </Canvas>
      <UI />
    </>
  );
}

export default App;
