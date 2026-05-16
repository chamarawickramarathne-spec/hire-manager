import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Photographers from "./pages/Photographers";
import Subscriptions from "./pages/Subscriptions";
import AccessLevels from "./pages/AccessLevels";
import AccessLogs from "./pages/AccessLogs";
import Login from "./pages/Login";
import { useAppContext } from "./context/AppContext";

const App: React.FC = () => {
  const { currentApp } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    const loginTime = localStorage.getItem("loginTimestamp");

    if (isAuth && loginTime) {
      const hoursSinceLogin =
        (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
      if (hoursSinceLogin > 24) {
        // 24 hours expiry
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("loginTimestamp");
        return false;
      }
      return true;
    }
    return false;
  });

  useEffect(() => {
    // Optional: Periodically check session while app is open
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTimestamp");
      if (loginTime) {
        const hoursSinceLogin =
          (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        if (hoursSinceLogin > 24) {
          handleLogout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTimestamp");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div
        className="app-container"
        style={{ display: "flex", minHeight: "100vh" }}
      >
        <Sidebar onLogout={handleLogout} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <div
            className="content"
            style={{ padding: "0 16px 0 0", overflowY: "auto", flex: 1 }}
          >
            <div className="container">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/photographers" element={<Photographers />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/access-levels" element={<AccessLevels />} />
                <Route path="/access-logs" element={<AccessLogs />} />
                <Route path="*" element={<Navigate to={currentApp === 'calculator' ? "/access-logs" : "/"} replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
