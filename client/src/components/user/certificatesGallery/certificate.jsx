import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faSort, faSortUp, faSortDown, faTh, faList, faPrint, faDownload } from "@fortawesome/free-solid-svg-icons"; // Import icons
import "./certificate.css";

function CertificateGrid() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date'); 
  const [viewMode, setViewMode] = useState('grid'); // State for grid/list view
  const eventsPerPage = 15;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/u/events`);
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchEvents();
  }, []);

  // Sort events 
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy.field === 'date') {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy.field === 'title') {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return sortBy.direction === 'asc' 
        ? titleA.localeCompare(titleB) 
        : titleB.localeCompare(titleA);
    }
  });

  // Calculate indexes for pagination (use sortedEvents)
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent); 

  // Handle page navigation
  const handleNextPage = () => {
    if (currentPage < Math.ceil(sortedEvents.length / eventsPerPage)) { 
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
          <div className="certificates-sort-container">
            <div className="certificates-sort-options">
                <div className="sort-group">
                  <span className="sort-icon"> {/* Added icon for "Sort by" */}
                    <FontAwesomeIcon icon={faSort} />
                  </span>
                  <select
                    id="sortField"
                    value={sortBy.field}
                    onChange={(e) => setSortBy({ ...sortBy, field: e.target.value })}
                    className="custom-select"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                  </select>

                  {/* Conditionally render sort direction icon */}
                  <span className="sort-icon">
                    {sortBy.direction === 'asc' ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </span>
                  <select
                    id="sortDirection"
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
                  {/* Conditionally render view mode icon */}
                  {viewMode === "grid" ? (
                    <FontAwesomeIcon icon={faTh} /> 
                  ) : (
                    <FontAwesomeIcon icon={faList} />
                  )}
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'certificates-grid' : 'certificates-list'}> 
              {currentEvents.map((event) => (
                <div key={event._id} className="certificates-link">
                  <div className={viewMode === 'grid' ? 'certificates-card' : 'certificates-list-item'}> 
                    {viewMode === 'list' ? ( // Conditional rendering for list view
                      <div className="list-view-container"> 
                        <img 
                          src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                          alt={event.title} 
                          className="list-view-image" 
                        /> 

                        <div className="column-first"> 
                          <h3 style={{ color: '#011c39' }}>{event.title}</h3>
                          <p className='date'>
                            {new Date(event.eventDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </p>
                        </div>

                        <div className="download-column"> 
                          <a
                            href={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                            download={event.title + ".jpg"} 
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                        
                              const link = document.createElement('a');
                              link.href = `http://localhost:3000/eventPictures/${event.eventPicture}`;
                              link.setAttribute('download', event.title + ".jpg"); 
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
                    ) : ( // Rendering for grid view (unchanged)
                      <>
                        <img 
                          src={`http://localhost:3000/eventPictures/${event.eventPicture}`} 
                          alt={event.title} 
                          className={`certificate-image ${viewMode === 'list' ? 'list-view-image' : ''}`} 
                        /> 

                        <div className="card-content"> 
                          <div className="column-first"> 
                            <h3 style={{ color: '#011c39' }}>{event.title}</h3>
                            <p className='date'>
                              {new Date(event.eventDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>

                          <div className="column-last"> 
                            <a 
                              href={`http://localhost:3000/eventPictures/${event.eventPicture}`}
                              download={event.title + ".jpg"} 
                              onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation();
                          
                                const link = document.createElement('a');
                                link.href = `http://localhost:3000/eventPictures/${event.eventPicture}`;
                                link.setAttribute('download', event.title + ".jpg"); 
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
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>❮ Prev</button>
        <button onClick={handleNextPage} disabled={currentPage === Math.ceil(events.length / eventsPerPage)}>Next ❯</button>
      </div>
    </div>
  );
}

export default CertificateGrid;