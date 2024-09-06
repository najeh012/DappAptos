import React from 'react';
import './aboutUs.css';
import aboutImage from './assets/about-img.png'; // Make sure to update the path if necessary

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      <div className="about-header">
        <h1>About <span>Us</span></h1>
        <p>A Web3 Platform for Collaborative and Decentralized AI Computation</p>
      </div>
      <div className="about-content">
        <div className="about-image">
          <img src={aboutImage} alt="About Us" />
        </div>
        <div className="about-text">
          <h2>We Are Trustrain</h2>
          <p>
            At TrustTrain, we harness the power of DePIN and blockchain technology to create a revolutionary AI training ecosystem. When you share your computing resources or datasets, you earn TrustTrain tokens as a reward. Our blockchain-based platform ensures secure, transparent, and efficient tracking of contributions and rewards.
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
