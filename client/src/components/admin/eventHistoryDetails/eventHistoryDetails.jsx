import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const EventDetails = () => {
    const { id } = useParams();
    const [eventDetail, setEventDetail] = useState(null);
    const [registeredCount, setRegisteredCount] = useState(0);
    const [attendedCount, setAttendedCount] = useState(0);
    const [attendedList, setAttendedList] = useState([]);
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch event details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                console.log(token);
                const eventResponse = await fetch(`http://localhost:3000/a/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const eventData = await eventResponse.json();
                setEventDetail(eventData);

                const registeredResponse = await fetch(`http://localhost:3000/a/event/registrations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const registeredData = await registeredResponse.json();
                setRegisteredCount(registeredData.length || 0);

                const attendedResponse = await fetch(`http://localhost:3000/a/event/form-submissions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const attendedData = await attendedResponse.json();
                setAttendedList(attendedData);
                setAttendedCount(attendedData.length || 0);

                const chartData = attendedData.map((item, index) => ({
                    name: `User ${index + 1}`,
                    eventRating: item.eventRating,
                }));
                setChartData(chartData);

                const usersResponse = await fetch('http://localhost:3000/a/users', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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

        // Users Table
        const matchedUsers = attendedList
            .map((attended) => {
                const user = users.find((u) => u._id.toString() === attended.userId.toString());
                return user ? { ...user, eventRating: attended.eventRating } : null;
            })
            .filter(Boolean);

        let y = 160;
        pdf.setFontSize(12);
        pdf.text('Participants Details:', 10, y);
        y += 10;
        matchedUsers.forEach((user, index) => {
            pdf.text(
                `${index + 1}. ${user.name || 'N/A'} | ${user.email || 'N/A'} | Rating: ${
                    user.eventRating || 'N/A'
                }`,
                10,
                y
            );
            y += 10;
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
                const user = users.find((u) => u._id.toString() === attended.userId.toString());
                return user ? { ...user, eventRating: attended.eventRating } : null;
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
                                            src={user.profilePicture}
                                            alt={`${user.name}'s profile`}
                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        'No Image'
                                    )}
                                </td>
                                <td>{user.name || 'N/A'}</td>
                                <td>{user.email || 'N/A'}</td>
                                <td>{user.phoneNumber || 'N/A'}</td>
                                <td>{user.role || 'N/A'}</td>
                                <td>{user.eventRating || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No matching users found</td>
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
                <button onClick={downloadPDF} className="download-btn">Download PDF</button>
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
                <UsersTable attendedList={attendedList} users={users} />
            </div>
        </div>
    );
};

export default EventDetails;
