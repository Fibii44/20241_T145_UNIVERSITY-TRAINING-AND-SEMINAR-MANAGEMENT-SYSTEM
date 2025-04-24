import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faTh,
  faList,
  faDownload,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "./certificate.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function CertificateGrid() {
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: "date", direction: "asc" });
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const certificatePerPage = 15;

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/u/certificates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Certificates response:', JSON.stringify(response.data, null, 2)); // Pretty print the response
        const updatedCertificates = response.data.map((certificate) => {
          console.log('Certificate event title:', certificate.eventId?.title); // Log specifically the event title
          console.log('Full certificate data:', JSON.stringify(certificate, null, 2)); // Pretty print each certificate
          return {
            ...certificate,
            previewImageUrl: `http://localhost:3000/certificates/${certificate.fileName}/preview`,
          };
        });
        setCertificates(updatedCertificates);
      } catch (err) {
        console.error("Failed to fetch certificates", err);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search query
  const filteredCertificates = certificates.filter((certificate) => {
    console.log('Filtering certificate:', certificate);
    return certificate.eventId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           certificate.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  });

  // Sort certificates
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    if (sortBy.field === "date") {
      const dateA = new Date(a.issuedDate);
      const dateB = new Date(b.issuedDate);
      return sortBy.direction === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy.field === "title") {
      const titleA = (a.eventId?.title || '').toLowerCase();
      const titleB = (b.eventId?.title || '').toLowerCase();
      return sortBy.direction === "asc"
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    }
  });

  // Pagination
  const indexOfLastCertificate = currentPage * certificatePerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatePerPage;
  const currentCertificate = sortedCertificates.slice(indexOfFirstCertificate, indexOfLastCertificate);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(sortedCertificates.length / certificatePerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="certificates-container card">
      <div className="search-filter-container">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="sort-group">
            <label>Sort by:</label>
            <select
              value={sortBy.field}
              onChange={(e) => setSortBy({ ...sortBy, field: e.target.value })}
              className="custom-select"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>

            <select
              value={sortBy.direction}
              onChange={(e) => setSortBy({ ...sortBy, direction: e.target.value })}
              className="custom-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className={`view-mode-button ${viewMode === "grid" ? "active" : ""}`}
            title={viewMode === "grid" ? "Grid View" : "List View"}
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faTh : faList} />
          </button>
        </div>
      </div>

      {/* Certificate List/Grid */}
      <div className={viewMode === "grid" ? "certificates-grid" : "certificates-list"}>
        {currentCertificate.map((certificate) => (
          <div key={certificate._id} className="certificates-link">
            <a
              href={`http://localhost:3000/certificates/${certificate.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="certificate-link"
            >
              <div className={viewMode === "grid" ? "certificates-card" : "certificates-list-item"}>
                <div className="column-first">
                  <h3 style={{ color: "#011c39" }}>
                    {certificate.eventId?.title || 'Untitled Event'}
                  </h3>
                  <p className="date">
                    {new Date(certificate.issuedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="download-column" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`http://localhost:3000/certificates/${certificate.fileName}`}
                    download={`${certificate.eventId?.title || 'certificate'}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </a>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          ❮ Prev
        </button>
        {Array.from({ length: Math.ceil(filteredCertificates.length / certificatePerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(filteredCertificates.length / certificatePerPage)}
        >
          Next ❯
        </button>
      </div>
    </div>
  );
}

export default CertificateGrid;
