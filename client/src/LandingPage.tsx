import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './LandingPage.css';
import log from './assets/log-removebg-preview.png'; // Existing log image
import resourcelogo from './assets/res.png'; // New resource logo
import AboutUs from './aboutUs';
import Experts from './Experts';
import TrainerDashboard from './TrainerDashboard';

const LandingPage: React.FC = () => {
  const [dynamicImage] = useState(log); // Default image

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo-container"> {/* Container to hold both logos */ }
          <img className="res-logo" src={resourcelogo} alt="Resource Logo" /> {/* Left animated logo */ }
          <img className="main-logo" src={log} alt="Logo" /> {/* Right logo */ }
        </div>
      </header>

      <main className="main-content">
        <TrainerDashboard />
        <div className="text-content">
          <h1>Share A Resource</h1>
          <p>Share your computing resources or datasets and earn tokens. By contributing your processing power or valuable data, you support the decentralized training of AI models and receive tokens in return.</p>
          <Link to="/register-resource"> {/* Link to Register Resource */}
            <button>Share</button>
          </Link>
        </div>

        <div className="text-content">
          <h1>Go to the Resource Center</h1>
          <p>Wanna train your federated learning model?</p>
          <Link to="/allocate"> {/* Link to Allocate Resource */}
            <button>Go to Resource Center</button>
          </Link>
        </div>

        <div className="text-content">
          <h1>Ask for Annotator Expert</h1>
          <p>An annotator expert who will leverage their expertise to annotate your dataset based on your needs.</p>
          <Link to="/ask-annotator-expert"> {/* Add route for Annotator Expert */}
            <button>Ask for Annotator Expert</button>
          </Link>
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
