import Footer from '../../components/user/footer/footer.jsx';
import { useState } from 'react';
import Sidebar from '../../components/user/navbars/sidebar.jsx';
import Topbar from '../../components/user/navbars/topbar.jsx';
import NotFound from '../../components/user/notFound/notFound.jsx';
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
        <NotFound />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
