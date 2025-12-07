import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Lazy-load all routes for safety
const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CrowdMonitoring = lazy(() => import("./pages/CrowdMonitoring"));
const AnomalyDetection = lazy(() => import("./pages/AnomalyDetection"));
const HelpDispatch = lazy(() => import("./pages/HelpDispatch"));
const PredictiveAnalytics = lazy(() => import("./pages/PredictiveAnalytics"));
const LostFound = lazy(() => import("./pages/LostFound"));
const NLPSummaries = lazy(() => import("./pages/NLPSummaries"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const EventSetup = lazy(() => import("./pages/EventSetup"));
const AuthorityDashboard = lazy(() => import("./pages/AuthorityDashboard"));
const MobileParticipant = lazy(() => import("./pages/MobileParticipant"));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-2xl text-blue-600 bg-black">
            Loading Event Rescue...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/crowd-monitoring"
            element={
              <Layout>
                <CrowdMonitoring />
              </Layout>
            }
          />
          <Route
            path="/anomaly-detection"
            element={
              <Layout>
                <AnomalyDetection />
              </Layout>
            }
          />
          <Route
            path="/help-dispatch"
            element={
              <Layout>
                <HelpDispatch />
              </Layout>
            }
          />
          <Route
            path="/predictive-analytics"
            element={
              <Layout>
                <PredictiveAnalytics />
              </Layout>
            }
          />
          <Route
            path="/lost-found"
            element={
              <Layout>
                <LostFound />
              </Layout>
            }
          />
          <Route
            path="/nlp-summaries"
            element={
              <Layout>
                <NLPSummaries />
              </Layout>
            }
          />
          <Route
            path="/notifications"
            element={
              <Layout>
                <Notifications />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route path="/event-setup" element={<EventSetup />} />
          <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
          <Route path="/mobile-participant" element={<MobileParticipant />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
