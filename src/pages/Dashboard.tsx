import {useEffect} from "react";
import {auth} from "../lib/firebase";
import {useNavigate} from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate("/");
        }
    }, [navigate]);

    return <DashboardLayout/>;
}
