import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import AddUserForm from '../../components/admin_add-personnel/add-personnel';
import NavbarWithSidebar from '../../components/sidebar/sidebar';
// import AnotherPage from '../../components/admin_another-page/another-page';

const AddPersonnelPage = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/');
  };

  return (
    <div className="NavbarWithSidebar-container">
      <NavbarWithSidebar />
      <div className="main-content">
        <AddUserForm />
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddPersonnelPage />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>
);