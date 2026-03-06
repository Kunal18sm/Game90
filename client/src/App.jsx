import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { Auth } from './components/Auth';
import { useStore } from './store';

function UIOverlay() {
  const activeShopPanel = useStore(state => state.activeShopPanel);
  const points = useStore(state => state.points);
  const inventory = useStore(state => state.inventory);
  const buyItem = useStore(state => state.buyItem);
  const energy = useStore(state => state.energy);
  const eatItem = useStore(state => state.eatItem);
  const setActiveShopPanel = useStore(state => state.setActiveShopPanel);

  useEffect(() => {
    // Hide loading screen once App mounts (suspense handles inner loading)
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) loadingEl.style.display = 'none';

    // Energy drain: 100% over 12 real-world hours
    // 12 hours = 43200 seconds -> drain per second = 100 / 43200 = 0.0023148
    const drainRatePerSec = 100 / (12 * 60 * 60);
    const interval = setInterval(() => {
      useStore.getState().drainEnergy(drainRatePerSec);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getShopDetails = (type) => {
    switch (type) {
      case 'banana': return { type: 'banana', title: '🍌 Fresh Banana', desc: '1 Piece (+50% Energy)', price: 10 };
      case 'fish': return { type: 'fish', title: '🐟 River Fish', desc: '1 Piece (+75% Energy)', price: 15 };
      case 'clothes': return { type: 'clothes', title: '👕 Trendy Clothes', desc: '1 Set', price: 499 };
      default: return null;
    }
  };

  const shopDetails = getShopDetails(activeShopPanel);

  return (
    <>
      <div className="ui-container">
        <h1>Mera Pyara 3D Shahar (React) 🏙️</h1>
        <p>⚠️ Pehle screen par click karein! Phir 🎮 W/A/S/D ya Arrow Keys se chalein • Mouse: Camera</p>
      </div>

      <div className="hud-container">
        <div className="energy-bar">
          <div className="energy-fill" style={{ width: `${energy}%`, background: energy > 20 ? '#2ecc71' : '#e74c3c' }}></div>
          <span>⚡ Energy: {Math.round(energy)}%</span>
        </div>
        <div className="wallet">💰 Pocket: ₹{points}</div>
        <div className="inventory">
          <h3>🎒 Bag</h3>
          <div className="inv-item">
            <span>🍌 Bananas: {inventory.banana}</span>
            {inventory.banana > 0 && <button className="eat-btn" onClick={() => eatItem('banana')}>EAT</button>}
          </div>
          <div className="inv-item">
            <span>🐟 Fishes: {inventory.fish}</span>
            {inventory.fish > 0 && <button className="eat-btn" onClick={() => eatItem('fish')}>EAT</button>}
          </div>
          <div className="inv-item">
            <span>👕 Clothes: {inventory.clothes} Sets</span>
          </div>
        </div>
      </div>

      {shopDetails && (
        <div className="shop-modal">
          <h2>{shopDetails.title}</h2>
          <p className="desc">{shopDetails.desc}</p>
          <p className="price">₹{shopDetails.price}</p>
          <div className="modal-actions">
            <button
              className={`buy-btn ${points >= shopDetails.price ? '' : 'disabled'}`}
              onClick={(e) => {
                e.stopPropagation();
                buyItem(shopDetails.price, shopDetails.type);
              }}
              disabled={points < shopDetails.price}
            >
              {points >= shopDetails.price ? 'BUY NOW' : 'NOT ENOUGH MONEY 😢'}
            </button>
            <button
              className="cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                setActiveShopPanel(null);
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const user = useStore(state => state.user);

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <UIOverlay />
      <Canvas shadows camera={{ position: [0, 15, 30], fov: 60, near: 1, far: 3000 }}>
        <fog attach="fog" args={['#87CEEB', 0.002]} />
        <ambientLight intensity={0.65} color={0xffffff} />
        <directionalLight
          castShadow
          position={[100, 200, 50]}
          intensity={0.85}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-camera-left={-180}
          shadow-camera-right={180}
          shadow-camera-top={180}
          shadow-camera-bottom={-180}
        />

        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <div className="loading" id="loading-overlay">
        React Shahar ban raha hai... Kripya pratiksha karein ⏳
      </div>
    </>
  );
}

export default App;
