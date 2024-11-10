import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './home-content.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Logic to handle search
    console.log(searchTerm);
  };

  return (
    <div className="home-background">
      <div className="overlay"></div>
      <h3>
        <span>BukSU</span> <span className="highlight">Engage</span>
      </h3>
      {/* Scroll down icon */}
      <div className="scroll-down">
        <FontAwesomeIcon icon={faChevronDown} bounce size="3x" />
      </div>
      <div className="scroll-down1">
        <FontAwesomeIcon icon={faChevronDown} bounce size="3x" />
      </div>
    </div>
  );
}

export default Home;