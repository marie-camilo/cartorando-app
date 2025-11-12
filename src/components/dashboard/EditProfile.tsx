import { useState } from "react";
import { useAuth } from "../../firebase/auth";
import { updateProfile } from "firebase/auth";
import { auth, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Button from '../Button';

const EditProfile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (avatar) {
        const avatarRef = ref(storage, `avatars/${user?.uid}`);
        const snapshot = await uploadBytes(avatarRef, avatar);
        const avatarURL = await getDownloadURL(snapshot.ref);
        await updateProfile(auth.currentUser!, {
          displayName,
          photoURL: avatarURL,
        });
      } else {
        await updateProfile(auth.currentUser!, { displayName });
      }
      alert("Profil mis à jour avec succès!");
      navigate("/dashboard");
    } catch (error) {
      alert("Erreur lors de la mise à jour du profil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center mb-6">Modifier le Profil</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="avatar" className="block text-lg font-medium">Avatar</label>
          {avatar && (
            <img
              src={URL.createObjectURL(avatar)}
              alt="Aperçu avatar"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          )}
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-lg font-medium">Nom d'utilisateur</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-lg font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            disabled
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-lg font-medium">Avatar</label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <Button
          type="submit"
          variant="orange"
          className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;
