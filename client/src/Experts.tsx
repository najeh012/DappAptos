import React from 'react';
import './Experts.css';

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
    profileImage: './assets/maher.jpeg', // Replace with actual image URLs
    linkedin: 'https://www.linkedin.com/in/maherboughdiri',
  },
  {
    id: 2,
    name: 'Nejeh Mansour',
    role: 'Web3 Developer | Aptos Developer',
    profileImage: './assets/najeh.jpg', // Replace with actual image URLs
    linkedin: 'https://www.linkedin.com/in/nejehmansour',
  },
  {
    id: 3,
    name: 'Touti Wafa',
    role: 'Marketing Head',
    profileImage: 'gg.png', // Replace with actual image URLs
    linkedin: 'https://www.linkedin.com/in/toutiwafa',
  },
  {
    id: 4,
    name: 'Firas Aisoui',
    role: 'IA Engineer | Federated Learning Specialist',
    profileImage: 'https://via.placeholder.com/100', // Replace with actual image URLs
    linkedin: 'https://www.linkedin.com/in/firasaisoui',
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
              <img src="https://image.flaticon.com/icons/png/512/174/174857.png" alt="LinkedIn" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experts;
