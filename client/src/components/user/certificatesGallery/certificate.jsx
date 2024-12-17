import React, { useState, useEffect } from "react";
import { Document, Page } from 'react-pdf';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faTh,
  faList,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import "./certificate.css";

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
        const updatedCertificates = response.data.map((certificate) => {
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
  const filteredCertificates = certificates.filter((certificate) =>
    certificate.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort certificates
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    if (sortBy.field === "date") {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return sortBy.direction === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy.field === "title") {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
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
      {/* Controls for Sorting and Search */}
      <div className="certificates-sort-container">
        <div className="certificates-sort-options">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-group">
            <span className="sort-icon">
              <FontAwesomeIcon icon={faSort} />
            </span>
            <select
              value={sortBy.field}
              onChange={(e) => setSortBy({ ...sortBy, field: e.target.value })}
              className="custom-select"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>
            <span className="sort-icon">
              {sortBy.direction === "asc" ? (
                <FontAwesomeIcon icon={faSortUp} />
              ) : (
                <FontAwesomeIcon icon={faSortDown} />
              )}
            </span>
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
            className="custom-button view-mode-button"
          >
            {viewMode === "grid" ? (
              <FontAwesomeIcon icon={faTh} />
            ) : (
              <FontAwesomeIcon icon={faList} />
            )}
          </button>
        </div>
      </div>

      {/* Certificate List/Grid */}
      <div className={viewMode === "grid" ? "certificates-grid" : "certificates-list"}>
        {currentCertificate.map((certificate) => (
          <div key={certificate.fileName} className="certificates-link">
            <div className={viewMode === "grid" ? "certificates-card" : "certificates-list-item"}>
              <div className="column-first">
                <h3 style={{ color: "#011c39" }}>{certificate.fileName}</h3>
                <p className="date">
                  {new Date(certificate.issueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="pdf-viewer">
                <Document file={`http://localhost:3000/certificates/${certificate.fileName}`}>
                  <Page pageNumber={1} />
                </Document>
              </div>
              <div className="download-column">
                <a
                  href={`http://localhost:3000/certificates/${certificate.fileName}`}
                  download={`${certificate.fileName}.jpg`}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </a>
              </div>
            </div>
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
