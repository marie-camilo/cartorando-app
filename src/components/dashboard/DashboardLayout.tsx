import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen mt-[100px]">
            <Sidebar/>
            <main className="flex-1 p-6 bg-gray-50 rounded-xl">
                <Outlet/>
            </main>
        </div>
    );
}
