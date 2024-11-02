import Footer from '../../components/user/footer/footer.jsx';
import { useState } from 'react';
import Sidebar from '../../components/user/sidebar/sidebar.jsx';
import Topbar from '../../components/user/sidebar/topbar.jsx';
import Certificate from '../../components/user/certificates/certificate.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';

const Certificates = ({ userId, eventId }) => {

  const [isCollapsed, setIsCollapsed] = useState(false);

    // Function to toggle sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
  return (

      <div className="dashboard-container">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="certificates"/>
        <div className="content">
          <Topbar />
          
          <Footer />
        </div>
      </div>

  )
};

export default Certificates;
