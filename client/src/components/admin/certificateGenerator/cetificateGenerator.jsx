import React, { useState, useRef, useEffect } from "react";

const CertificateGenerator = () => {
  const [template, setTemplate] = useState(null);
  const [userName, setUserName] = useState("");
  const canvasRef = useRef(null);

  const handleTemplateUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("template", file);
  
    try {
      const response = await axios.post("http://localhost:3000/api/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTemplate(response.data.templateUrl); // Assuming the server returns the saved template URL
    } catch (error) {
      console.error("Error uploading template:", error);
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Clear the canvas and draw the template
    const img = new Image();
    img.src = template;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add the user's name in the center
      context.font = "30px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.fillText(userName, canvas.width / 2, canvas.height / 2);

      // Print the canvas
      const dataUrl = canvas.toDataURL("image/png");
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`<img src="${dataUrl}" onload="window.print()" />`);
      newWindow.document.close();
    };
  };    
  return (
    <div>
      <div>
        <label>Upload Certificate Template:</label>
        <input type="file" accept="image/*" onChange={handleTemplateUpload} />
      </div>
      <div>
        <label>Enter User's Name:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div>
        {template && (
          <canvas
            ref={canvasRef}
            width={800} // Adjust based on your template size
            height={600} // Adjust based on your template size
            style={{ display: "none" }}
          />
        )}
        <button onClick={handlePrint}>Print Certificate</button>
      </div>
    </div>
  );
};

export default CertificateGenerator;