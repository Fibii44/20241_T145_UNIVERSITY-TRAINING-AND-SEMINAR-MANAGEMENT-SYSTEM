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
import './eventHistoryDetails.css';

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

    const durationInMs = end - start; // Difference in milliseconds
    const durationInMinutes = Math.floor(durationInMs / (1000 * 60)); // Convert to total minutes

    const hours = Math.floor(durationInMinutes / 60); // Calculate hours
    const minutes = durationInMinutes % 60; // Calculate remaining minutes

    return `${hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''} ${
        minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''
    }`.trim(); // Construct and return the string
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
                <YAxis domain={[1, 5]} /> {/* Set the domain to 1-5 for ratings */}
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="eventRating"
                    stroke="#4caf50"
                    fillOpacity={1}
                    fill="url(#colorRating)"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);



const EventDetails = () => {
    const { id } = useParams();
    const [eventDetail, setEventDetail] = useState(null);
    const [registeredCount, setregisteredCount] = useState(0);
    const [attendedCount, setAttendedCount] = useState(0);
    const [attendedList, setAttendedList] = useState(0)
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState({
        responses: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:3000/a/events/${id}`);
                const data = await response.json();
                setEventDetail(data);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchregisteredCount = async () => {
            try {
                const response = await fetch(`http://localhost:3000/a/event/registrations/${id}`);
                const data = await response.json();
                setregisteredCount(data.length || 0);
            } catch (error) {
                console.error('Error fetching attendees count:', error);
            }
        };
        //Participants who attended
        const fetchAttendedUsersCount = async () => {
            try {
                const response = await fetch(`http://localhost:3000/a/event/form-submissions/${id}`);
                const data = await response.json();
                setAttendedCount(data.length || 0);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };
        const fetchAttended = async () => {
            try {
                const response = await fetch(`http://localhost:3000/a/event/form-submissions/${id}`);
                const data = await response.json();
        
                // Extract eventRating for the chart
                const chartData = data.map((item, index) => ({
                    name: `User ${index + 1}`,
                    eventRating: parseInt(item.eventRating), // Convert rating to number if needed
                }));
        
                setChartData(chartData); // Set chart data
                setAttendedList(data);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };
        

        fetchEvent();
        fetchAttended();
        fetchregisteredCount();
        fetchAttendedUsersCount();
        setLoading(false);
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!eventDetail) {
        return <div>No event details available for this ID.</div>;
    }
    
    // UsersTable Component
    const UsersTable = ({ users }) => {
        console.log("users:", users);
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
                        {Array.isArray(users) && users.map(user => (
                            <tr key={user.id}>
                                <td>{user.userId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    return (
        <div className="dashboard-container">
            <div className="content">
                <h2 className="dashboard-heading">Event Report</h2>

                <div className="event-container">
                    <div className="card-wrapper">
                        <div className="details-section">
                            <img
                                src={`http://localhost:3000/eventPictures/${eventDetail?.eventPicture}`}
                                alt={`${eventDetail?.title || 'No'} image`}
                                className="event-img"
                            />
                            <h3 className="title-heading">{eventDetail?.title}</h3>
                            <p className="description-text">{eventDetail?.description}</p>
                            <div className="info-container">
                                <span>
                                    <FontAwesomeIcon icon={faCalendarCheck} /> {eventDetail?.date}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faClock} /> {eventDetail?.time}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {eventDetail?.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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
                        count={
                            eventDetail.startTime && eventDetail.endTime
                                ? calculateEventDuration(eventDetail.startTime, eventDetail.endTime)
                                : 'N/A'
                        }
                        icon={<FontAwesomeIcon icon={faClock} size="2x" />}
                        color="#ff3b30"
                    />
                </div>

                <Chart chartData={chartData} />
                <UsersTable users={attendedList} />
            </div>
        </div>
    );
};

export default EventDetails;