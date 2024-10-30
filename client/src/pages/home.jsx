import Footer from '../components/footer/footer.jsx';
import { useState } from 'react';
import NavbarWithSidebar from '../components/sidebar/sidebar.jsx';
import HomeContent from '../components/homecontent/home-content.jsx'
import Events from '../components/events-grid/events-grid.jsx'; 

import '@fortawesome/fontawesome-free/css/all.min.css';

const HomePage = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);

    // Function to toggle sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
  return (

      <div className="dashboard-container">
        <NavbarWithSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="home"/>
        <div className="content">
          <HomeContent />
          <Events />
          <Footer />
        </div>
      </div>

  )
};

export default HomePage;
