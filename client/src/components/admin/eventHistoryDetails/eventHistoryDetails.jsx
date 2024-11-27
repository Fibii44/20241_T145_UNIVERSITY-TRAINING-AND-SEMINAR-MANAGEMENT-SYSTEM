import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // For route parameters
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarCheck, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import Sidebar from '../../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../../components/admin/navbars/topbar/topbar';
import './eventHistoryDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

// Chart Component
const Chart = ({ chartData }) => (
    <div className="chart">
        <h2 className="userstat-heading">Participants Rating & Satisfaction</h2>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
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
                <Area
                    type="monotone"
                    dataKey="TotalUsers"
                    stroke="#FF4B4B"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
                <Area
                    type="monotone"
                    dataKey="ActiveUsers"
                    stroke="#9b51e0"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// UsersTable Component
const UsersTable = ({ users }) => (
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

const EventDetails = () => {
    const { id } = useParams(); // Get event ID from the URL
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [eventDetail, setEventDetail] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${API_URL}/a/events/${id}`);
                const data = await response.json();
                setEventDetail(data);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchChartData = async () => {
            try {
                const response = await fetch(`${API_URL}/a/events/${id}/statistics`);
                const data = await response.json();
                setChartData(data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/a/events/${id}/participants`);
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };

        fetchEvent();
        fetchChartData();
        fetchUsers();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!eventDetail) {
        return <div>No event details available for this ID.</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="content">
                <h2 className="dashboard-heading">Event Report</h2>

                <div className="event-container">
                    <div className="card-wrapper">
                        <div className="details-section">
                            <img
                                src={eventDetail.image || 'fallback-image.png'}
                                alt={eventDetail.title}
                                className="image-thumbnail"
                            />
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
                    <StatCard
                        title="Attendees Registered"
                        count={eventDetail.registeredAttendees}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#4a90e2"
                    />
                    <StatCard
                        title="Participants Attended"
                        count={eventDetail.participantsAttended}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#9b51e0"
                    />
                    <StatCard
                        title="Participants Absent"
                        count={eventDetail.participantsAbsent}
                        icon={<FontAwesomeIcon icon={faUsers} size="2x" />}
                        color="#F08080"
                    />
                    <StatCard
                        title="Event Duration"
                        count={`${eventDetail.eventDuration} Hours`}
                        icon={<FontAwesomeIcon icon={faClock} size="2x" />}
                        color="#ff3b30"
                    />
                </div>

                <Chart chartData={chartData} />
                <UsersTable users={users} />
            </div>
        </div>
    );
};

export default EventDetails;
