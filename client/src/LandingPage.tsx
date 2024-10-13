import React, { useState } from 'react';
import './LandingPage.css';
import log from './assets/log-removebg-preview.png'; // Existing log image
import resourcelogo from './assets/res.png'; // New resource logo
import AboutUs from './aboutUs';
import Experts from './Experts';

const LandingPage: React.FC = () => {
  const [dynamicImage] = useState(log); // Default image

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo-container"> {/* Container to hold both logos */}
          <img className="res-logo" src={resourcelogo} alt="Resource Logo" /> {/* Left animated logo */}
          <img className="main-logo" src={log} alt="Logo" /> {/* Right logo */}
        </div>
      </header>
      
      <main className="main-content">
        <div className="text-content">
          <h1>Share A Resource</h1>
          <p>Share your computing resources or datasets and earn tokens. By contributing your processing power or valuable data, you support the decentralized training of AI models and receive tokens in return.</p>
          <button>Share</button>
        </div>

        <div className="image-content">
          <img src={dynamicImage} alt="Dynamic" />
        </div>

        <div className="text-content">
          <h1>Go to the Resource Center</h1>
          <p>Wanna train your federated learning model?</p>
          <button>Share</button>
        </div>
      </main>

      <section className="about-section">
        <AboutUs />
      </section>

      <section className="experts-section">
        <Experts />
      </section>
    </div>
  );
};

export default LandingPage;
