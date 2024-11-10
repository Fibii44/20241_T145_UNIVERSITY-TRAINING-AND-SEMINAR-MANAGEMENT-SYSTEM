import Footer from '../../components/user/footer/footer.jsx';
import { useState } from 'react';
import Sidebar from '../../components/user/navbars/sidebar.jsx';
import Topbar from '../../components/user/navbars/topbar.jsx';
import HomeContent from '../../components/user/homecontent/home-content.jsx'
import Events from '../../components/user/eventList/eventList.jsx'; 
import '@fortawesome/fontawesome-free/css/all.min.css';

const HomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="home" />
      <div className={`content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <Topbar />
        <HomeContent />
        <Events />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
