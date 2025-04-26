import React, { useState, useEffect, useRef } from 'react';
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
import generatePDF from 'react-to-pdf';
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

// New component for cleaner PDF output
const PrintableContent = ({ eventDetail, registeredCount, attendedCount, chartData, departmentData, collegeData, attendedList, users }) => {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    
    const eventDuration = calculateEventDuration(eventDetail.startTime, eventDetail.endTime);
    
    // Match users for the table and create organized data by college and department
    const matchedUsers = attendedList
        .map((attended) => {
            const user = users.find((u) => u._id && attended.userId && u._id.toString() === attended.userId.toString());
            if (user) {
                return { 
                    ...user, 
                    eventRating: attended.eventRating,
                    responses: attended.responses 
                };
            } else {
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

    // Organize participants by college and department
    const organizedData = {};
    matchedUsers.forEach((user) => {
        const college = user.college || 'Unspecified College';
        const department = user.department || 'Unspecified Department';
        
        if (!organizedData[college]) {
            organizedData[college] = {};
        }
        
        if (!organizedData[college][department]) {
            organizedData[college][department] = [];
        }
        
        organizedData[college][department].push(user);
    });
    
    return (
        <div className="pdf-capture-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #011c39', paddingBottom: '10px' }}>
                <img src={Logo} alt="Logo" style={{ width: '40px', marginRight: '15px' }} />
                <h1 style={{ color: '#011c39', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{eventDetail?.title} - Event Report</h1>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#011c39', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '18px', margin: '10px 0' }}>Event Details</h2>
                <p><strong>Date:</strong> {new Date(eventDetail.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Time:</strong> {formatTime(eventDetail?.startTime)} - {formatTime(eventDetail?.endTime)}</p>
                <p><strong>Location:</strong> {eventDetail?.location}</p>
                <p><strong>Duration:</strong> {eventDuration}</p>
                <p><strong>Description:</strong> {eventDetail?.description}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#011c39', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '18px', margin: '10px 0' }}>Event Statistics</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px', border: '1px solid #ddd', padding: '10px', margin: '5px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Total Registrations</p>
                        <p style={{ fontSize: '24px', margin: 0 }}>{registeredCount}</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px', border: '1px solid #ddd', padding: '10px', margin: '5px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Participants Attended</p>
                        <p style={{ fontSize: '24px', margin: 0 }}>{attendedCount}</p>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px', border: '1px solid #ddd', padding: '10px', margin: '5px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Participants Absent</p>
                        <p style={{ fontSize: '24px', margin: 0 }}>{registeredCount - attendedCount}</p>
                    </div>
                </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#011c39', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '18px', margin: '10px 0' }}>Participants by College & Department</h2>
                
                {Object.keys(organizedData).length > 0 ? (
                    Object.keys(organizedData).map((college) => (
                        <div key={college} style={{ marginBottom: '20px' }}>
                            <h3 style={{ 
                                color: '#011c39',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '5px',
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '10px 0'
                            }}>
                                {college}
                            </h3>
                            
                            {Object.keys(organizedData[college]).map((department) => (
                                <div key={department} style={{ marginBottom: '15px', marginLeft: '15px' }}>
                                    <h4 style={{ 
                                        color: '#333',
                                        borderBottom: '1px solid #eee', 
                                        paddingBottom: '5px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        margin: '8px 0'
                                    }}>
                                        {department}
                                    </h4>
                                    
                                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                        {organizedData[college][department].map((user, index) => (
                                            <li key={user._id || index} style={{ marginBottom: '8px', padding: '5px 0', borderBottom: '1px dotted #eee' }}>
                                                {index + 1}. {user.name || 'N/A'} 
                                                <span style={{ float: 'right', marginRight: '20px' }}>
                                                    Rating: <strong>{user.eventRating || 'N/A'}</strong>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No participant data available.</p>
                )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#011c39', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '18px', margin: '10px 0' }}>Summary Statistics</h2>
                
                <h3 style={{ color: '#333', fontSize: '16px', margin: '15px 0 10px 0' }}>Participants by Department</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Department</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Participants</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departmentData.map((dept) => (
                            <tr key={dept.name}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dept.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dept.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <h3 style={{ color: '#333', fontSize: '16px', margin: '15px 0 10px 0' }}>Participants by College</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>College</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f8f9fa' }}>Participants</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collegeData.map((college) => (
                            <tr key={college.name}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{college.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{college.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <p>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                <p>University Training and Seminar Management System</p>
            </div>
        </div>
    );
};

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
    
    // Reference for the printable content
    const printableRef = useRef(null);

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

    // Generate PDF using the printable content reference
    const handleDownloadPDF = () => {
        const options = {
            filename: `${eventDetail?.title || 'Event_Report'}.pdf`,
            page: { 
                margin: 10, 
                format: 'a4',
                orientation: 'portrait' 
            },
            canvas: {
                mimeType: 'image/png',
                qualityRatio: 1
            },
            overrides: {
                // Override pdf options
                pdf: {
                    compress: true,
                    userUnit: 1.0,
                    hotfixes: ["px_scaling"]
                },
                // Override canvas options
                canvas: {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 800,
                    windowHeight: 1200,
                    logging: true
                }
            }
        };
        
        // Use the imported default function with the ref
        generatePDF(printableRef, options);
    };

    return (
        <>
            {/* Printable content for PDF generation - positioned offscreen instead of display:none */}
            <div 
                ref={printableRef} 
                style={{ 
                    position: 'absolute', 
                    width: '210mm', /* A4 width */
                    left: '-9999px', 
                    top: 0,
                    backgroundColor: 'white'
                }}
            >
                <PrintableContent 
                    eventDetail={eventDetail}
                    registeredCount={registeredCount}
                    attendedCount={attendedCount}
                    chartData={chartData}
                    departmentData={departmentData}
                    collegeData={collegeData}
                    attendedList={attendedList}
                    users={users}
                />
            </div>
            
            {/* Visible content */}
            <div className="event-details-container">
                <div className="event-header">
                <h2 className="event-report-title">Event Report</h2>
                <div className="action-buttons">
                        <button onClick={handleDownloadPDF} className="download-btn">Download PDF</button>
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
                </div>
                
                <div className="event-content">
                    <div className="event-info-section">
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

                    <div className="event-stats-section">
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
            </div>
        </>
    );
};

export default EventDetails;
