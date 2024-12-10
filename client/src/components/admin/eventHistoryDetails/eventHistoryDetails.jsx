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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Logo from "../../../assets/buksu-logo.png"

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
    const [attendedList, setAttendedList] = useState([])
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState({
        eventRating: 0
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
                    eventRating: item.eventRating, // Convert rating to number if needed
                }));
                console.log(chartData);
                
                setChartData(chartData); // Set chart data
                setAttendedList(data);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };
        // const fetchAggregatedAttendees = async () => {
        //     try {
        //         const response = await fetch(`http://localhost:3000/a/event/attendees/${id}`);
        //         const data = await response.json();
        //         setUsers(data); // Set the aggregated data
        //     } catch (error) {
        //         console.error('Error fetching aggregated attendees:', error);
        //     }
        // };
        const token = sessionStorage.getItem("authToken");
        const fetchUsers = async () => {
                try {
                    const response = await fetch('http://localhost:3000/a/users', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data); // Store the fetched users
                    } else if (response.status === 403) {
                        navigate('/a/dashboard'); // Redirect if access is denied
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            };
        
        // fetchAggregatedAttendees()
        fetchUsers();
        fetchEvent();
        fetchAttended();
        fetchregisteredCount();
        fetchAttendedUsersCount();
        setLoading(false);
    }, [id]);

    const downloadPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const { html2canvas } = await import("html2canvas"); // For chart rendering
        const pdf = new jsPDF();
    
        // Add Logo
        const logoURL = Logo; // Replace with your logo URL or base64 string
        const logo = await fetch(logoURL).then((res) => res.blob()).then((blob) => URL.createObjectURL(blob));
        pdf.addImage(logo, "PNG", 10, 5, 30, 15); // Adjust size and position as needed
    
        // Title
        pdf.setFontSize(18);
        pdf.text("Event Report", 50, 15);
    
        // Event Details with Formatted Date
        const formatDate = (dateStr, format = "YYYY-MM-DD") => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "N/A"; // Handle invalid date
            const options =
                format === "Month DD, YYYY"
                    ? { year: "numeric", month: "long", day: "numeric" }
                    : { year: "numeric", month: "2-digit", day: "2-digit" };
            return new Intl.DateTimeFormat("en-US", options).format(date);
        };
    
        pdf.setFontSize(14);
        pdf.text(`Event: ${eventDetail?.title || "N/A"}`, 10, 30);
        pdf.text(`Date: ${formatDate(eventDetail?.eventDate, "Month DD, YYYY")}`, 10, 40);
        pdf.text(`Location: ${eventDetail?.location || "N/A"}`, 10, 50);
        
        // Summary Data
        pdf.setFontSize(12);
        const totalAttendees = attendedList.length || 0;
        const totalRegistrations = users.length || 0;
        const avgRating = (
            attendedList.reduce((sum, attended) => sum + (attended.eventRating || 0), 0) /
            (totalAttendees || 1)
        ).toFixed(2);
        
        let summaryY = 60;
        pdf.text(`Total Attendees: ${totalAttendees}`, 10, summaryY);
        pdf.text(`Total Registrations: ${totalRegistrations}`, 10, summaryY + 10);
        pdf.text(`Average Rating: ${avgRating}`, 10, summaryY + 20);
        pdf.text(`Description: ${eventDetail?.description || "N/A"}`, 10, summaryY + 30)
        // Render Chart (if applicable)
        const chartElement = document.getElementById("chart-container"); // Replace with your chart container's ID
        if (chartElement) {
            const chartCanvas = await html2canvas(chartElement);
            const chartData = chartCanvas.toDataURL("image/png");
            pdf.addImage(chartData, "PNG", 10, summaryY + 30, 180, 80); // Adjust size and position
            summaryY += 90; // Adjust Y position for the next section
        }
    
        // Table Heading
        pdf.setFontSize(12);
        const tableStartY = summaryY + 40;
        const tableHeaders = ["ID", "Name", "Email", "Phone", "Role", "Rating"];
        let y = tableStartY;
        const lineHeight = 10;
    
        pdf.setFontSize(10);
        pdf.text(tableHeaders.join(" | "), 10, y);
        pdf.line(10, y + 2, 200, y + 2); // Line under header
        y += lineHeight;
    
        // Table Rows
        const matchedUsers = attendedList
            .map((attended) => {
                const user = users.find((u) => u._id === attended.userId);
                return user ? { ...user, eventRating: attended.eventRating } : null;
            })
            .filter(Boolean);
    
        matchedUsers.forEach((user) => {
            const row = [
                user.userId || "N/A",
                user.name || "N/A",
                user.email || "N/A",
                user.phoneNumber || "N/A",
                user.role || "N/A",
                user.eventRating || "N/A",
            ];
            pdf.text(row.join(" | "), 10, y);
            y += lineHeight;
    
            // Handle page overflow
            if (y > 280) {
                pdf.addPage();
                y = 10;
            }
        });
    
        // Save the PDF
        pdf.save(`${eventDetail?.title || "event-report"}.pdf`);
    };
    
    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!eventDetail) {
        return <div>No event details available for this ID.</div>;
    }
    
// UsersTable Component
const UsersTable = ({ attendedList = [], users = [] }) => {
    if (!Array.isArray(attendedList) || !Array.isArray(users)) {
        console.error("Invalid data: 'attendedList' or 'users' is not an array");
        return null;
    }

    // Match attendedList to users by userId
    const matchedUsers = attendedList
    .map((attended) => {
        const user = users.find((u) => {
            // console.log("Comparing:", attended.userId, u._id);
            return u._id === attended.userId;
        });
        return user ? { ...user, eventRating: attended.eventRating } : null;
    })
    .filter(Boolean);

    return (
        <div className="table-container">
            <h2 className="users-heading">Registered Participants Attended</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
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
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.name || "N/A"}</td>
                                <td>{user.email || "N/A"}</td>
                                <td>{user.phoneNumber || "N/A"}</td>
                                <td>{user.role || "N/A"}</td>
                                <td>{user.eventRating || "N/A"}</td>
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

    
    
    return (
        <div className="dashboard-container">
            <div className="event-container">
            <h2 className="dashboard-heading">Event Report</h2>
            <button onClick={downloadPDF} className="download-btn">Download PDF</button>
                    <div className="card-wrapper">
                        <div className="details-section">
                            <img
                                src={`http://localhost:3000/eventPictures/${eventDetail?.eventPicture}`}
                                alt={`${eventDetail?.title || 'No'} image`}
                                className="history-event-img"
                                onError={(e) => (e.target.src = '/src/assets/default-eventPicture.jpg')}
                            />
                            <h3 className="title-heading">{eventDetail?.title}</h3>
                            <p className="description-text">{eventDetail?.description}</p>
                            <div className="info-container">
                                <span>
                                    <FontAwesomeIcon icon={faCalendarCheck} /> {eventDetail?.eventDate}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faClock} /> {eventDetail?.startTime}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {eventDetail?.location}
                                </span>
                            </div>
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
                    <UsersTable attendedList={attendedList} users={users} />
                </div>
            </div>
    
    );
};

export default EventDetails;