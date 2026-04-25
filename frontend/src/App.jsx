import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import AdminDashboard from "./components/admin/AdminDashboard";
import HospitalDashboard from "./components/hospital/HospitalDashboard";
import ProtectedRoute from "./components/context/ProtectedRoute";
import Home from "./components/user/Home";
import Navbar from "./components/user/Navbar";
import Footer from "./components/user/Footer";
import About from "./components/user/About";
import Services from "./components/user/Services";
import Doctors from "./components/user/Doctors";
import Blogs from "./components/user/Blogs";
import Notification from "./components/user/Notification"; // import your Notification component
import Hospital from "./components/user/Hospital";
import Service from "./components/user/Service";
import Dr from "./components/user/Dr";
import Contact from "./components/user/Contact";
import HospitalInfo from "./components/user/HospitalInfo";
import Appointment from "./components/user/Appointment";
import Payment from "./components/user/Payment"; // import your Payment component
import NotFound from "./components/404/NotFound";
// User Layout component
const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public user-facing homepage */}
        <Route
          path="/"
          element={
            <UserLayout>
              <div id="home"><Home /></div>
              <div id="about"><About /></div>
              <div id="services"><Services /></div>
              <div id="doctors"><Doctors /></div>
              <div id="blog"><Blogs /></div>
            </UserLayout>
          }
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Pages */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <UserLayout>
                <div id="home"><Home /></div>
                <div id="about"><About /></div>
                <div id="services"><Services /></div>
                <div id="doctors"><Doctors /></div>
                <div id="blog"><Blogs /></div>
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital_info"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Hospital />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Service />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Dr />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Contact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital/info/:id"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <HospitalInfo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Appointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={[0]}>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Hospital Dashboard */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
}

export default App;
