import { Outlet } from "react-router-dom"
import Header from "./components/Navbar"
import { Toaster } from "react-hot-toast"

export default function App() {
  return (
    <div>
      <Header/>
      <main>
        <Outlet/>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  )
}
