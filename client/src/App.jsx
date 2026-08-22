import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginRegister from "./pages/LoginRegister";
import Login from "./pages/login"; // Ensure we have a direct login page too
import Register from "./pages/register";
import Donors from "./pages/donor";
import RegisterDonor from "./pages/RegisterDonor";
import BloodRequests from "./pages/BloodRequests";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import DonationHistory from "./pages/DonationHistory";
import HospitalRegister from "./pages/HospitalRegister";
import PostRequest from "./pages/PostRequest";
import StockManagement from "./pages/StockManagement";
import Notifications from "./pages/Notifications";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginRegister />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hospital/register" element={<HospitalRegister />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/requests" element={<BloodRequests />} />

              {/* Protected Shared Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute role="user">
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute role="user">
                    <DonationHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register-donor"
                element={
                  <ProtectedRoute role="user">
                    <RegisterDonor />
                  </ProtectedRoute>
                }
              />

              {/* Protected Hospital Routes */}
              <Route
                path="/hospital/post"
                element={
                  <ProtectedRoute role="hospital">
                    <PostRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hospital/stock"
                element={
                  <ProtectedRoute role="hospital">
                    <StockManagement />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
