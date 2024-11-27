import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './home-content.css';
import bg1 from '../../../assets/homebg1.jpg';
import bg2 from '../../../assets/homebg2.jpg';
import bg3 from '../../../assets/homebg3.jpg';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // List of background images
  const backgrounds = [
    bg1,
    bg2,
    bg3,
  ];

  // Effect to change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000); // Change every 5000ms (5 seconds)

    return () => clearInterval(interval); // Cleanup on unmount
  }, [backgrounds.length]);

  return (
    <div
      className="home-background"
      style={{
        backgroundImage: `url(${backgrounds[backgroundIndex]})`,
      }}
    >
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
