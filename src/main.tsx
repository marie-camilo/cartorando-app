import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import App from './App'

import Home from './pages/Home'
import HikeList from './pages/HikeList'
import HikeView from './pages/HikeView'
import HikeNew from './pages/HikeNew'
import HikeEdit from "./pages/HikeEdit"
import LogIn from './pages/LogIn'
import Profile from './pages/Dashboard'
import './index.css'
import {AuthProvider, useAuth} from './firebase/auth'
import Dashboard from "./pages/Dashboard";
import Overview from "./components/dashboard/Overview";
import MyHikes from "./components/dashboard/MyHikes";
import Favorites from "./components/dashboard/Favorites";
import EditProfile from './components/dashboard/EditProfile';

type PrivateRouteProps = { children: React.ReactNode }

function PrivateRoute({children}: PrivateRouteProps) {
    const {user} = useAuth()
    return user ? <>{children}</> : <LogIn/>
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            {index: true, element: <Home/>},
            {path: 'hikes/list', element: <HikeList/>},
            {path: 'hikes/new', element: <PrivateRoute><HikeNew/></PrivateRoute>},
            {path: '/hikes/edit/:id', element: <PrivateRoute><HikeEdit/></PrivateRoute>},

            {path: 'hikes/:id', element: <HikeView/>},
            {path: 'profile', element: <PrivateRoute><Profile/></PrivateRoute>},
            {path: 'login', element: <LogIn/>},

            {
                path: 'dashboard',
                element: <PrivateRoute><Dashboard/></PrivateRoute>,
                children: [
                    {index: true, element: <Overview/>},
                    {path: 'hikes', element: <MyHikes/>},
                    {path: 'favorites', element: <Favorites/>},
                    { path: 'preferences', element: <EditProfile /> },
                ]
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    </React.StrictMode>
)
