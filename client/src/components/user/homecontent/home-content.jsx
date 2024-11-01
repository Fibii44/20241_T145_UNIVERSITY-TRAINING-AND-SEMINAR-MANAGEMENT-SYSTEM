import { useState } from 'react';
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
      {/* <div className="search-container">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div> */}
    </div>
  );
}

export default Home;