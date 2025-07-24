import './App.css';
import React, { useContext } from 'react' 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QueryForm from './QueryForm.js';
import MapCoords from './MapCoords.js';
import ReportForm from './ReportForm.js';
import AuthPage, { AuthContext } from './AuthPage.js'; 

//TO DO
// comment programs
// take out some debug console logs

//COMPLETED TODAY
// commented main, authpage, and app
// rebuilt docker, is correct version now
// fixed small errors
//updated readme

//COMPLETED Wednesday
// fixed the reloading issue
// fixed username issue (made it so it is case insenstive when checking if it exists already)
// username is now not required to sign in, only sign up
//       the box only pops up after sign up button is hit for the first time

// the app is only accessable after user is authorized
export default function App() {
  return (
    <Router>
      <AuthPage>
        <AppContent/>
      </AuthPage>
    </Router>
  )
}

const AppContent = () => {
  const { user, handleSignOut, isLoadingAuth } = useContext(AuthContext); 

  const isAuthenticated = !!user; 

  if (isLoadingAuth) {
    return (
      <div className="app-loading">
        <p>Initializing application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="App">
      <h1 className="header"> Landslides </h1>
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-list">Home</Link>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/query" className="nav-list">Query</Link>
              </li>
              <li className="nav-item">
                <Link to="/report" className="nav-list">Report</Link>
              </li>
            </>
          )}
          {user ? ( 
            <>
              <li className="nav-item nav-text">
                Logged in as: {user.username} 
              </li>
              <li className="nav-item">
                <button onClick={handleSignOut} className="nav-button">Logout</button>
              </li>
            </>
          ) : (
            <li className="nav-item"></li>
          )}
        </ul>
      </nav>

      <div className="content-area">
        <Routes>
          <Route path="/" element={<MapCoords/>} />
          <Route path="/query" element={<QueryForm/>} />
          <Route path="/report" element={<ReportForm/>} />
        </Routes>
      </div>
    </div>
  );
};