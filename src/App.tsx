import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Entries from "./pages/Entries";
import EntryForm from "./pages/EntryForm";
import Assessments from "./pages/Assessments";
import AssessmentForm from "./pages/AssessmentForm";
import Settings from "./pages/Settings";
import { PWAProvider } from "./context/PWAContext";
import Layout from "./components/layout/Layout";

export default function App() {
  return (
    <PWAProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/entries/new" element={<EntryForm mode="create" />} />
          <Route path="/entries/:id" element={<EntryForm mode="edit" />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:category" element={<AssessmentForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PWAProvider>
  );
}
