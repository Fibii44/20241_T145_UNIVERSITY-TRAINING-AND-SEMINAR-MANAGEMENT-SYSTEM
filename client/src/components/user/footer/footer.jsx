import { useState } from 'react'
import BukSULogo from '/src/assets/buksu.png'
import './footer.css'

function Footer() {

  return (
    <>
     
      <footer>
        <div className="footer-container">
            <div className="footer-left">
                <div className="footer-left-top">
                    <img src={BukSULogo} alt="BukSU Logo" />  
                    <div className='location'>
                        <h3>BUKIDNON STATE UNIVERSITY</h3>
                        <p>Malaybalay City, Bukidnon 8700,</p>
                        <p>Philippines</p>
                    </div>      
                    <div className='info'>
                        <div className='footer-header'>
                            <p>Contact Us</p>
                        </div>
                        <div className='footer-content'>
                            <p>Fortich St., Malaybalay City,</p>
                            <p>Bukidnon</p>
                            <p>+63-88-813-5661 To 5663</p>
                            <p>+63-88-813-2717</p>
                        </div>  
                    </div>   
                    <div className='info'>
                        <div className='footer-header'>
                            <p>Services</p>
                        </div>
                        <div className='footer-content'>
                            <p>Admission</p>
                            <p>Events</p>
                            <p>Manage Training and Seminar</p>
                            <p>Schedules</p>
                        </div> 
                        <div className='footer-content'>

                        </div>
                    </div>    
                    <div className='info'>
                        <div className='footer-header'>
                            <p>Contact Us</p>
                        </div>
                        <div className='footer-content'>
                            <p>Fortich St., Malaybalay City,</p>
                            <p>Bukidnon</p>
                            <p>+63-88-813-5661 To 5663</p>
                            <p>+63-88-813-2717</p>
                        </div>  
                    </div>     
                </div>
                <div className="footer-left-bottom">
                    <h3>Educate . Innovate . Lead</h3>
                    <p>Copyright 2024 BukSU. All rights reserved.</p>
                </div> 
            </div>
        </div>
      </footer>
    </>
    
  )
}

export default Footer
