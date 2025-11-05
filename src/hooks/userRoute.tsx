import { useEffect } from "react";
import { useAuth } from "../firebase/auth";
import { useRole } from "./useRole";
import { useNavigate } from "react-router-dom";

type UserRouteProps = {
  children: React.ReactNode
}

export default function UserRoute({ children }: UserRouteProps) {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, navigate]);

  if (!user || isAdmin) return null;

  return <>{children}</>;
}
