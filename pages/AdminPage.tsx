import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AdminAreaPage } from "./AdminAreaPage";

export function AdminPage() {
  const { isLoggedIn, isAdmin } = useAuth();

  // Redirect if not logged in or not admin
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/mitgliederbereich" replace />;
  }

  return <AdminAreaPage />;
}
