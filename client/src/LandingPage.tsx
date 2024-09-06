import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import log from './assets/log-removebg-preview.png';
const LandingPage: React.FC = () => {

  const navigate = useNavigate();

  const handleShareClick = () => {
    navigate('/register-resource');
  };

  const handleShareClick1 = () => {
    navigate('/allocate');
  };


  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo"> {/* Logo placeholder */}
          <img src={log} alt="Logo" />
        </div>
        
      </header>
      <main className="main-content">
        <div className="text-content">
          <h1>Share A Resource</h1>
          <p>Share your computing resources or datasets and earn tokens. By contributing your processing power or valuable data, you support the decentralized training of AI models and receive tokens in return.</p>
          <button onClick={handleShareClick}>Share</button>
        </div>
        <br />
        <br />
        <div className="text-content">
          <h1>Go to the Reesource Center </h1>
          <p>Wanna train your federated learning model .</p>
          <button onClick={handleShareClick1}>Share</button>
        </div>
        <div className="image-content">
          <img src={log} alt="Landing" />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
