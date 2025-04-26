import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarCheck, faClock, faMapMarkerAlt, faChartBar, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import './eventHistoryDetails.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '../../../assets/buksu-logo.png';

// StatCard Component
const StatCard = ({ title, count, icon, color }) => (
    <div className="card">
        <div className="card-content">
            <h3>{title}</h3>
            <p>{count}</p>
        </div>
        <div className="icon" style={{ color }}>
            {icon}
        </div>
    </div>
);

const calculateEventDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInMs = end - start;
    const hours = Math.floor(durationInMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''} ${
        minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''
    }`.trim();
};

const Chart = ({ chartData }) => (
    <div className="chart">
        <h2 className="userstat-heading">Participants Rating & Satisfaction</h2>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis domain={[1, 5]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="eventRating" stroke="#4caf50" fillOpacity={1} fill="url(#colorRating)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// New component for department statistics
const DepartmentBreakdown = ({ departmentData, collegeData, selectedFilter, onFilterChange }) => (
    <div className="department-breakdown">
        <div className="department-header">
            <h2 className="department-heading">Department Breakdown</h2>
            <select 
                value={selectedFilter} 
                onChange={(e) => onFilterChange(e.target.value)}
                className="department-filter"
            >
                <option value="all">All Colleges</option>
                {collegeData.map((college) => (
                    <option key={college.name} value={college.name}>{college.name}</option>
                ))}
            </select>
        </div>
        
        <div className="department-charts">
            <div className="department-barchart">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="department-piechart">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={departmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {departmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        <div className="department-stats-cards">
            {departmentData.map((dept) => (
                <div key={dept.name} className="department-stat-card">
                    <div className="department-stat-content">
                        <h4>{dept.name}</h4>
                        <p>{dept.count} Participants</p>
                    </div>
                    <div className="icon" style={{ color: '#4a90e2' }}>
                        <FontAwesomeIcon icon={faGraduationCap} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const EventDetails = () => {
    const { id } = useParams();
    const [eventDetail, setEventDetail] = useState(null);
    const [registeredCount, setRegisteredCount] = useState(0);
    const [attendedCount, setAttendedCount] = useState(0);
    const [attendedList, setAttendedList] = useState([]);
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departmentData, setDepartmentData] = useState([]);
    const [collegeData, setCollegeData] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all');

    // Fetch event details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                
                const eventResponse = await fetch(`http://localhost:3000/a/events/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const eventData = await eventResponse.json();
                setEventDetail(eventData);

                const registeredResponse = await fetch(`http://localhost:3000/a/event/registrations/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const registeredData = await registeredResponse.json();
                setRegisteredCount(registeredData.length || 0);

                const attendedResponse = await fetch(`http://localhost:3000/a/event/form-submissions/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                const attendedData = await attendedResponse.json();
                
                // Enhanced logging to debug form data issues
                console.log("Received form submissions:", attendedData);
                
                setAttendedList(attendedData);
                setAttendedCount(attendedData.length || 0);

                // Create chart data, ensuring we handle missing or zero ratings
                const chartData = attendedData
                    .filter(item => item.eventRating > 0) // Only include items with valid ratings
                    .map((item, index) => ({
                        name: item.userName || `User ${index + 1}`,
                        eventRating: item.eventRating || 0,
                    }));
                    
                console.log("Chart data:", chartData);
                setChartData(chartData);

                const usersResponse = await fetch('http://localhost:3000/a/users', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);

                // Process department data once we have users and attended list
                if (usersData.users?.length && attendedData.length) {
                    processDepartmentData(usersData.users, attendedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Process department data
    const processDepartmentData = (users, attendedList) => {
        const departmentCounts = {};
        const collegeCounts = {};
        
        // Match attended users with their departments
        const matchedUsers = attendedList
            .map((attended) => {
                const user = users.find((u) => u._id.toString() === attended.userId.toString());
                return user || null;
            })
            .filter(Boolean);
        
        // Count by department
        matchedUsers.forEach(user => {
            if (user.department) {
                departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;
            }
            
            if (user.college) {
                collegeCounts[user.college] = (collegeCounts[user.college] || 0) + 1;
            }
        });
        
        // Convert to array format for charts
        const departmentDataArray = Object.keys(departmentCounts).map(dept => ({
            name: dept,
            count: departmentCounts[dept]
        }));
        
        const collegeDataArray = Object.keys(collegeCounts).map(college => ({
            name: college,
            count: collegeCounts[college]
        }));
        
        setDepartmentData(departmentDataArray);
        setCollegeData(collegeDataArray);
    };

    // Filter department data based on selected college
    const getFilteredDepartmentData = () => {
        if (selectedDepartmentFilter === 'all') {
            return departmentData;
        }
        
        // First, find all users from the selected college
        const collegeUsers = users.filter(user => user.college === selectedDepartmentFilter);
        
        // Then, get departments from those users
        const collegeDepartments = collegeUsers.map(user => user.department).filter(Boolean);
        
        // Finally, filter the department data to only include those departments
        return departmentData.filter(dept => collegeDepartments.includes(dept.name));
    };

    const downloadPDF = async () => {
        const pdf = new jsPDF();

        // Add Logo
        const logo = await fetch(Logo).then((res) => res.blob()).then((blob) => URL.createObjectURL(blob));
        pdf.addImage(logo, 'PNG', 10, 5, 30, 15);

        // Title
        pdf.setFontSize(18);
        pdf.text('Event Report', 50, 15);

        // Event Details
        pdf.setFontSize(14);
        pdf.text(`Event: ${eventDetail?.title || 'N/A'}`, 10, 30);
        pdf.text(`Date: ${new Date(eventDetail.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ` || 'N/A', 10, 40);
        pdf.text(`Location: ${eventDetail?.location || 'N/A'}`, 10, 50);

        // Summary Data
        pdf.text(`Total Registrations: ${registeredCount}`, 10, 60);
        pdf.text(`Participants Attended: ${attendedCount}`, 10, 70);
        pdf.text(`Participants Absent: ${registeredCount - attendedCount}`, 10, 80);

        // Chart Screenshot
        const chartElement = document.querySelector('.chart');
        if (chartElement) {
            const chartCanvas = await html2canvas(chartElement);
            const chartImage = chartCanvas.toDataURL('image/png');
            pdf.addImage(chartImage, 'PNG', 10, 90, 180, 60);
        }

        // Department Breakdown
        pdf.setFontSize(16);
        pdf.text('Participants by Department', 10, 160);
        
        let yPosition = 170;
        
        departmentData.forEach((dept, index) => {
            pdf.setFontSize(12);
            pdf.text(`${dept.name}: ${dept.count} participants`, 15, yPosition);
            yPosition += 10;
            
            // If we're reaching the bottom of the page, create a new page
            if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
            }
        });
        
        // Create a new page for college breakdown
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Participants by College', 10, 20);
        
        yPosition = 30;
        collegeData.forEach((college) => {
            pdf.setFontSize(12);
            pdf.text(`${college.name}: ${college.count} participants`, 15, yPosition);
            yPosition += 10;
        });

        // Department chart screenshot
        const deptChartElement = document.querySelector('.department-charts');
        if (deptChartElement) {
            const deptChartCanvas = await html2canvas(deptChartElement);
            const deptChartImage = deptChartCanvas.toDataURL('image/png');
            pdf.addPage();
            pdf.text('Department Charts', 10, 20);
            pdf.addImage(deptChartImage, 'PNG', 10, 30, 180, 100);
        }

        // Users Table
        const matchedUsers = attendedList
            .map((attended) => {
                // Try to find the associated user
                const user = users.find((u) => u._id && attended.userId && u._id.toString() === attended.userId.toString());
                
                // If found, merge the data, otherwise use what we have from the form
                if (user) {
                    return { 
                        ...user, 
                        eventRating: attended.eventRating,
                        responses: attended.responses 
                    };
                } else {
                    // Use form data for user info if no matching user found
                    return {
                        _id: attended.id,
                        name: attended.userName,
                        email: attended.userEmail,
                        phoneNumber: 'N/A',
                        college: 'N/A',
                        department: 'N/A',
                        role: 'N/A',
                        eventRating: attended.eventRating,
                        responses: attended.responses
                    };
                }
            })
            .filter(Boolean);

        // Add users table to a new page
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Participants Details:', 10, 20);
        
        yPosition = 30;
        matchedUsers.forEach((user, index) => {
            pdf.setFontSize(12);
            pdf.text(
                `${index + 1}. ${user.name || 'N/A'} | ${user.email || 'N/A'} | ${user.department || 'N/A'} | Rating: ${
                    user.eventRating || 'N/A'
                }`,
                10,
                yPosition
            );
            yPosition += 10;
            
            // If we're reaching the bottom of the page, create a new page
            if (yPosition > 270 && index < matchedUsers.length - 1) {
                pdf.addPage();
                yPosition = 20;
            }
        });

        // Save PDF
        pdf.save(`${eventDetail?.title || 'Event_Report'}.pdf`);
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!eventDetail) {
        return <div>No event details available for this ID.</div>;
    }

    const UsersTable = ({ attendedList = [], users = [] }) => {
        const matchedUsers = attendedList
            .map((attended) => {
                // Try to find the associated user
                const user = users.find((u) => u._id && attended.userId && u._id.toString() === attended.userId.toString());
                
                // If found, merge the data, otherwise use what we have from the form
                if (user) {
                    return { 
                        ...user, 
                        eventRating: attended.eventRating,
                        responses: attended.responses 
                    };
                } else {
                    // Use form data for user info if no matching user found
                    return {
                        _id: attended.id,
                        name: attended.userName,
                        email: attended.userEmail,
                        phoneNumber: 'N/A',
                        college: 'N/A',
                        department: 'N/A',
                        role: 'N/A',
                        eventRating: attended.eventRating,
                        responses: attended.responses
                    };
                }
            })
            .filter(Boolean);

        return (
            <div className="table-container">
                <h2 className="users-heading">Registered Participants Attended</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>College</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                    {matchedUsers.length > 0 ? (
                        matchedUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    {user.profilePicture ? (
                                        <img
                                            src={`http://localhost:3000/profilePictures/${user.profilePicture}`}
                                            alt={`${user.name}'s profile`}
                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/src/assets/default-profile.png';
                                            }}
                                        />
                                    ) : (
                                        'No Image'
                                    )}
                                </td>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email || 'N/A'}</td>
                                <td>{user.phoneNumber || 'N/A'}</td>
                                <td>{user.college || 'N/A'}</td>
                                <td>{user.department || 'N/A'}</td>
                                <td>{user.role || 'N/A'}</td>
                                <td>{user.eventRating || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No matching users found</td>
                        </tr>
                    )}
                </tbody>

                </table>
            </div>
        );
    };

    const eventDuration = calculateEventDuration(eventDetail.startTime, eventDetail.endTime);
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="dashboard-container">
            <div className="event-container">
                <h2 className="event-report-title">Event Report</h2>
                <div className="action-buttons">
                    <button onClick={downloadPDF} className="download-btn">Download PDF</button>
                    {eventDetail?.formId ? (
                        <a 
                            href={eventDetail.formId} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="forms-btn"
                        >
                            View Form Responses
                        </a>
                    ) : (
                        <button className="forms-btn disabled" disabled>
                            No Forms Available
                        </button>
                    )}
                </div>
                <div className="details-section">
                    <img
                        src={`http://localhost:3000/eventPictures/${eventDetail?.eventPicture}`}
                        alt="Event"
                        className="history-event-img"
                        onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                    />
                    <h3>{eventDetail?.title}</h3>
                    <p>{eventDetail?.description}</p>
                    <div className="info-container">
                        <span>
                            <FontAwesomeIcon icon={faCalendarCheck} /> {new Date(eventDetail.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                        <span>
                            <FontAwesomeIcon icon={faClock} /> {formatTime(eventDetail?.startTime)} - {formatTime(eventDetail?.endTime)}
                        </span>
                        <span>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {eventDetail?.location}
                        </span>
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="dashboard">
                    <StatCard
                        title="Attendees Registered"
                        count={registeredCount}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#4a90e2"
                    />
                    <StatCard
                        title="Participants Attended"
                        count={attendedCount}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#9b51e0"
                    />
                    <StatCard
                        title="Participants Absent"
                        count={registeredCount - attendedCount}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#F08080"
                    />
                    <StatCard
                        title="Event Duration"
                        count={eventDuration}
                        icon={<FontAwesomeIcon icon={faClock} size="2x" />}
                        color="#ff3b30"
                    />
                </div>
                <Chart chartData={chartData} />
                <DepartmentBreakdown 
                    departmentData={getFilteredDepartmentData()} 
                    collegeData={collegeData}
                    selectedFilter={selectedDepartmentFilter}
                    onFilterChange={setSelectedDepartmentFilter}
                />
                <UsersTable attendedList={attendedList} users={users} />
            </div>
        </div>
    );
};

export default EventDetails;
