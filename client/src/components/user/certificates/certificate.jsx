import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const CertificateGenerator = ({ userId, eventId }) => {
  const [template, setTemplate] = useState(null);
  const [userName, setUserName] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch user name and certificate template URL for the event
    const fetchUserData = async () => {
      try {
        // Replace with your API endpoint to get user and event details
        const userResponse = await axios.get(`http://localhost:3000/api/user/${userId}`);
        const eventResponse = await axios.get(`http://localhost:3000/api/events/${eventId}`);

        setUserName(userResponse.data.name);  // Assuming name field in user data
        setTemplate(eventResponse.data.templateUrl); // Assuming templateUrl field in event data
      } catch (error) {
        console.error("Error fetching user or event data:", error);
      }
    };

    fetchUserData();
  }, [userId, eventId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const img = new Image();
    img.src = template;

    img.onload = () => {
      // Draw the template on the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add the user's name to the canvas
      context.font = "30px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.fillText(userName, canvas.width / 2, canvas.height / 2);

      // Create a download link for the canvas
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${userName}_certificate.png`;
      link.click();
    };
  };

  return (
    <div>
      {template && (
        <canvas
          ref={canvasRef}
          width={800} // Adjust based on your template size
          height={600} // Adjust based on your template size
          style={{ display: "none" }}
        />
      )}
      <button onClick={handleDownload}>Download Certificate</button>
    </div>
  );
};

export default CertificateGenerator;