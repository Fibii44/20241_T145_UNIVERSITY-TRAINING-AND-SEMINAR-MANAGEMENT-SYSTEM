import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams for route parameters
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarCheck, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../component/adminbar/sidebar';
import Topbar from '../../component/adminbar/topbar';
import '../../component/adminbar/css/admin.css';

// Temporary data for statisfactory Chart
const data = [

];

// Sample events data
const events = [
    {
        id: 1,
        title: 'GAD SEMINAR',
        description: 'Gender and Development 21st Certificate Course in Industrial Relations and Human Resource Management',
        date: 'October 16, 2024',
        time: '5:30 am',
        location: 'BukSU Mini Theater',
        image: 'path/to/image1.png',
    },
    {
        id: 2,
        title: 'IALU LEADERS TRAINING',
        description: 'Hansen Leadership Institute 2025 in USA (Fully Funded) 3 Weeks Summer Exchange Program at the San Diego, California.',
        date: 'March 10, 2025',
        time: '11:30 am',
        location: 'BukSU Research Center',
        image: 'path/to/image2.png',
    },
    {
        id: 3,
        title: 'MENTAL HEALTH SEMINAR',
        description: 'COT Mental Health Awareness Seminar',
        date: 'March 10, 2025',
        time: '11:30 am',
        location: 'BukSU Research Center',
        image: 'path/to/image3.png',
    },
];

// Temporary data for the event details
const eventStatistics = {

    registeredAttendees: 150,
    participantsAttended: 120,
    participantsAbsent: 30,
    eventDuration: 3,
};



const StatCard = ({ title, count, icon, color }) => (
    <div className="card">
        <div className="card-content">
            <h3>{title}</h3>
            <p>{count}</p>
        </div>
        <div className="icon" style={{ color }}>{icon}</div>
    </div>
);

const Chart = () => (
    <div className="chart">
        <h2 className="userstat-heading">Participants Rating & Satisfaction</h2>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4B4B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF4B4B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b51e0" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#9b51e0" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="TotalUsers" stroke="#FF4B4B" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="ActiveUsers" stroke="#9b51e0" fillOpacity={1} fill="url(#colorActive)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const UsersTable = () => {
    const users = [
        // ...user data
    ];

    return (
        <div className="table-container">
            <h2 className="users-heading">Registered Participants Attended</h2>
            <table className="table table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Position</th>
                        <th>Gender</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.position}</td>
                            <td>{user.gender}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EventDetails = () => {
    const { id } = useParams(); // Get event ID from the URL
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [eventDetail, setEventDetail] = useState(null);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Find the event based on the ID from the URL
    useEffect(() => {
        const event = events.find(event => event.id === parseInt(id));
        setEventDetail(event);
    }, [id]);

    if (!eventDetail) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="history" />
            <div className="content">
                <Topbar />
                <h2 className="dashboard-heading">Event Report</h2>

                <div className="event-container">
                    <div className="card-wrapper">
                        <div className="details-section">
                            <img src={eventDetail.image} alt={eventDetail.title} className="image-thumbnail" />
                            <h3 className="title-heading">{eventDetail.title}</h3>
                            <p className="description-text">{eventDetail.description}</p>
                            <div className="info-container">
                                <span>
                                    <FontAwesomeIcon icon={faCalendarCheck} /> {eventDetail.date}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faClock} /> {eventDetail.time}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {eventDetail.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="dashboard">
                    <StatCard title="Attendees Registered" count={eventStatistics.registeredAttendees} icon={<FontAwesomeIcon icon={faUsers} size="2x" />} color="#4a90e2" />
                    <StatCard title="Participants Attended" count={eventStatistics.participantsAttended} icon={<FontAwesomeIcon icon={faUsers} size="2x" />} color="#9b51e0" />
                    <StatCard title="Participants Absent" count={eventStatistics.participantsAbsent} icon={<FontAwesomeIcon icon={faUsers} size="2x" />} color="#F08080" />
                    <StatCard title="Event Duration" count={`${eventStatistics.eventDuration} Hours`} icon={<FontAwesomeIcon icon={faClock} size="2x" />} color="#ff3b30" />
                </div>
                <Chart />
                <UsersTable />
            </div>
        </div>
    );
};

export default EventDetails;
