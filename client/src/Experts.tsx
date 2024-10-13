import React from 'react';
import './Experts.css';
import maherImage from './assets/maher.jpeg'; // Import the actual image
import najehImage from './assets/najeh.jpg';  // Import the actual image
import toutiImage from './assets/gg.png'; // Import your image
import linkedinlogo from './assets/linkedinlogo.png' // LinkedIn icon

interface Expert {
  id: number;
  name: string;
  role: string;
  profileImage: string;
  linkedin: string;
}

const experts: Expert[] = [
  {
    id: 1,
    name: 'Maher Boughdiri',
    role: 'Project Lead | Blockchain & AI Researcher',
    profileImage: maherImage, // Use imported image
    linkedin: 'https://www.linkedin.com/in/maherboughdiri',
  },
  {
    id: 2,
    name: 'Nejeh Mansour',
    role: 'Web3 Developer | AI Enthusiast',
    profileImage: najehImage, // Use imported image
    linkedin: 'https://www.linkedin.com/in/nejehmansour',
  },
  {
    id: 3,
    name: 'Touti Wafa',
    role: 'Marketing Head',
    profileImage: toutiImage, // Use imported image
    linkedin: 'https://www.linkedin.com/in/toutiwafa',
  },
  {
    id: 4,
    name: 'Mohamed Hkima',
    role: 'BlockChain Engineer | Federated Learning Specialist',
    profileImage: 'https://via.placeholder.com/100', // External placeholder
    linkedin: 'https://www.linkedin.com/in/mohamed-hkima/',
  },
];

const Experts: React.FC = () => {
  return (
    <div className="experts">
      <h1>Our <span>Experts</span></h1>
      <div className="experts-container">
        {experts.map((expert) => (
          <div key={expert.id} className="expert-card">
            <div className="expert-image">
              <img src={expert.profileImage} alt={expert.name} />
            </div>
            <h2>{expert.name}</h2>
            <p>{expert.role}</p>
            <a href={expert.linkedin} target="_blank" rel="noopener noreferrer">
              <img src={linkedinlogo} alt="LinkedIn" /> {/* Use imported LinkedIn icon */}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experts;
