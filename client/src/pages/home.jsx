// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import Footer from '../components/footer/footer.jsx';
// import NavbarWithSidebar from '../components/sidebar/sidebar.jsx';
// import Home from '../components/homecontent/home-content.jsx'

// import Events from '../components/events-grid/events-grid.jsx';
// import Login from './Login.jsx'

// import '@fortawesome/fontawesome-free/css/all.min.css';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <div className="NavbarWithSidebar-container">
//         <NavbarWithSidebar />
//         <div className="main-content">
//           <Routes>
//             <Route 
//               path="/" 
//               element={
//                 <>
//                   <Home />
//                   <Events />
//                   <Login />
//                 </>
//               } 
//             />
//             <Route path="/eventsss" element={<Events />} />
//           </Routes>
//         </div>
//         <Footer />
//       </div>
//     </BrowserRouter>
//   </StrictMode>
// );


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx'
import LoginSuccess from './LoginSuccess.jsx';
import Footer from '../components/footer/footer.jsx';
import NavbarWithSidebar from '../components/sidebar/sidebar.jsx';
import HomeContent from '../components/homecontent/home-content.jsx'
import Events from '../components/events-grid/events-grid.jsx';



import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="NavbarWithSidebar-container">
        <NavbarWithSidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login/success" element={<LoginSuccess />} />
            <Route path="/home" element={<HomeContent />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
);
