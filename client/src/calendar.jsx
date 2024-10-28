import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = '952405432022-1nb4rrh6208kt2u70nu53h75eu1q3kdo.apps.googleusercontent.com'; // Replace with your actual client ID
const API_KEY = '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'; // Replace with your actual API key
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Load the Google API client library
    const initClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: SCOPES,
      }).then(() => {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);
        setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());

        // Fetch events if signed in
        if (isSignedIn) {
          listUpcomingEvents();
        }
      });
    };

    gapi.load('client:auth2', initClient);
  }, [isSignedIn]);

  // Sign in the user
  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  // Sign out the user
  const handleSignOutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  // Fetch upcoming events
  const listUpcomingEvents = () => {
    gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime',
    }).then(response => {
      const events = response.result.items;
      setEvents(events);
    });
  };

  return (
    <div>
      <h2>Google Calendar Events</h2>
      {isSignedIn ? (
        <div>
          <button onClick={handleSignOutClick}>Sign Out</button>
          <ul>
            {events.map(event => (
              <li key={event.id}>
                <strong>{event.summary}</strong>
                <p>{new Date(event.start.dateTime || event.start.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={handleAuthClick}>Sign in with Google</button>
      )}
    </div>
  );
}

export default Calendar;
