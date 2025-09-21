import { useAuth } from "../firebase/auth"

export default function Home() {
    const { user } = useAuth()
    return (
        <div>
            <h1>Accueil</h1>
            {user ? <p>Bonjour {user.displayName}</p> : <p>Non connecté</p>}
        </div>
    )
}
