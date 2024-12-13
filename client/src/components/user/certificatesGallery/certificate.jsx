import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Document, Page } from 'react-pdf';
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSort,
  faSortUp,
  faSortDown,
  faTh,
  faList,
  faPrint,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import "./certificate.css";

function CertificateGrid() {
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: "date", direction: "asc" });
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const certificatePerPage = 15;

 
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/u/certificates', { headers: { Authorization: `Bearer ${token}` } }); // Replace with your actual API endpoint
        const updatedCertificates = response.data.map((certificate) => {
          return {
            ...certificate,
            previewImageUrl: `http://localhost:3000/certificates/${certificate.fileName}/preview` // Replace with your actual preview image endpoint
          };
        });
        setCertificates(updatedCertificates);
      } catch (err) {
        console.error("Failed to fetch certificates", err);
      }
    };

    fetchCertificates();
  }, []);

  // Filter events based on search query
  const filteredCertificates = certificates.filter((certificate) =>
    certificate.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort events
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

  // Handle page navigation
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
      {/* Sorting and View Mode Controls */}
      <div className="certificates-sort-container">
        <div className="certificates-sort-options">
                {/* Search Bar */}
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
              id="sortField"
              value={sortBy.field}
              onChange={(e) =>
                setSortBy({ ...sortBy, field: e.target.value })
              }
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
              id="sortDirection"
              value={sortBy.direction}
              onChange={(e) =>
                setSortBy({ ...sortBy, direction: e.target.value })
              }
              className="custom-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button
            onClick={() =>
              setViewMode(viewMode === "grid" ? "list" : "grid")
            }
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

      {/* Event List/Grid */}
      <div
        className={
          viewMode === "grid" ? "certificates-grid" : "certificates-list"
        }
      >
        {currentCertificate.map((certificate) => (
          <div key={certificate.fileName} className="certificates-link">
            <div
              className={
                viewMode === "grid"
                  ? "certificates-card"
                  : "certificates-list-item"
              }
            >
              {/* Render based on view mode */}
              {viewMode === "list" ? (
                <div className="list-view-container">
                    {currentCertificate.map((certificate) => (
                      <div key={certificate.fileName} className="certificates-link">
                        <div className="certificates-list-item">
                          <div className="column-first">
                            <h3 style={{ color: "#011c39" }}>{certificate.fileName}</h3>
                            <p className="date">
                            {new Date(certificate.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
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
                              download={certificate.fileName + ".jpg"}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const link = document.createElement("a");
                                link.href = `http://localhost:3000/certificates/${certificate.fileName}`;
                                link.setAttribute(
                                  "download",
                                  certificate.fileName + ".jpg"
                                );
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <div className="download-icon">
                                <FontAwesomeIcon icon={faDownload} />
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                    {currentCertificate.map((certificate) => (
                      <div key={certificate.fileName} className="certificates-link">
                        <div className="certificates-list-item">
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
                              download={certificate.fileName + ".jpg"}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const link = document.createElement("a");
                                link.href = `http://localhost:3000/certificates/${certificate.fileName}`;
                                link.setAttribute(
                                  "download",
                                  certificate.fileName + ".jpg"
                                );
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <div className="download-icon">
                                <FontAwesomeIcon icon={faDownload} />
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}

                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          ❮ Prev
        </button>
        {Array.from(
          { length: Math.ceil(filteredCertificates.length / certificatePerPage) },
          (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`page-number-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          )
        )}
        <button
          onClick={handleNextPage}
          disabled={
            currentPage ===
            Math.ceil(filteredCertificates.length / certificatePerPage)
          }
        >
          Next ❯
        </button>
      </div>
    </div>
  );
}

export default CertificateGrid;
