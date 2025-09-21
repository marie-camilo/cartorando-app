import {Outlet} from "react-router-dom";
import Header from "./components/Navbar";

export default function App() {
    return (
        <div>
            <Header/>
            <main>
                <Outlet/>
            </main>
        </div>
    );
}
