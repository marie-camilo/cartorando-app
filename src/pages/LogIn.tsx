import { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, User, signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addUserToFirestore } from "../utils/firestoreUtils";
import Button from "../components/Button";

export default function LogIn() {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);

    const navigate = useNavigate();

    // Connexion avec Google
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Utilisateur Google :", result.user.displayName, result.user.email);
            await addUserToFirestore(result.user);
            setUser(result.user);
            navigate("/dashboard");
        } catch (err) {
            console.error("Erreur lors de la connexion avec Google :", err);
            setError("Erreur lors de la connexion avec Google");
        }
    };

    // Déconnexion
    const handleSignOut = async () => {
        await signOut(auth);
        setUser(null);
    };

    // Authentification par email
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            let userCredential;
            if (isSignUp) {
                console.log("Inscription avec nom :", name, "email :", email);
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Mettre à jour le displayName dans Firebase Auth
                await updateProfile(user, { displayName: name });
                await addUserToFirestore(user, name);
            } else {
                console.log("Connexion avec email :", email);
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                await addUserToFirestore(userCredential.user);
            }
            const user = userCredential.user;
            setUser(user);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
      <div className="flex items-center justify-center p-4 bg-[var(--white)]">
          <div className="flex flex-col md:flex-row w-full max-w-6xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                  {user ? (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-6">Bienvenue 🎉</h1>
                        <p className="mb-4">Connecté : {user.displayName || user.email}</p>
                        <Button onClick={handleSignOut} className="w-full">
                            Se déconnecter
                        </Button>
                    </div>
                  ) : (
                    <>
                        <h1 className="text-3xl font-semibold text-left mb-3">
                            En route avec CartoRando !
                        </h1>
                        <h3 className="text-xl font-medium text-left mb-8">
                            Connectez-vous ou inscrivez-vous pour planifier vos prochaines randonnées.
                        </h3>

                        {/* Formulaire Email */}
                        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
                            {isSignUp && (
                              <input
                                type="text"
                                placeholder="Nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--corail)]"
                              />
                            )}
                            <input
                              type="email"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--corail)]"
                            />
                            <input
                              type="password"
                              placeholder="Mot de passe"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--corail)]"
                            />
                            <Button
                              type="submit"
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                {isSignUp ? "Créer un compte" : "Se connecter"}
                            </Button>
                        </form>

                        <p className="text-center text-sm mb-6">
                            {isSignUp ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
                            <button
                              type="button"
                              onClick={() => setIsSignUp(!isSignUp)}
                              className="hover:underline [color:var(--corail)] cursor-pointer"
                            >
                                {isSignUp ? "Se connecter" : "Créer un compte"}
                            </button>
                        </p>

                        {/* Séparateur */}
                        <div className="flex items-center mb-6">
                            <hr className="flex-grow border-gray-300" />
                            <span className="mx-3 text-gray-500 text-sm">ou</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <button
                          onClick={handleGoogleSignIn}
                          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 cursor-pointer"
                        >
                            <img src="/src/assets/google-icon.svg" alt="Google" className="w-5 h-5" />
                            <span>Continuer avec Google</span>
                        </button>

                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    </>
                  )}
              </div>

              <div className="hidden md:block md:w-1/2 relative">
                  <img
                    src="public/images/connexion-img.jpg"
                    alt="Illustration"
                    className="object-cover w-full h-full rounded-b-2xl md:rounded-r-2xl md:rounded-b-none"
                  />
              </div>
          </div>
      </div>
    );
}