import { db } from "../lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";

// Fonction pour ajouter ou mettre à jour un utilisateur dans Firestore
export const addUserToFirestore = async (user: User, name?: string) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    // Si le document existe déjà, ne mettez à jour que les champs nécessaires
    if (userSnapshot.exists()) {
      console.log("Utilisateur déjà existant dans Firestore, mise à jour partielle.");
      await setDoc(
        userDocRef,
        {
          email: user.email, // Mettre à jour l'email si nécessaire
          lastUpdated: new Date(), // Ajouter un champ pour suivre la dernière mise à jour
        },
        { merge: true }
      );
    } else {
      // Si le document n'existe pas, créez-le avec le displayName
      const displayName = name || user.displayName || "Anonyme";
      console.log("Ajout de l'utilisateur à Firestore avec displayName :", displayName);
      await setDoc(userDocRef, {
        displayName,
        email: user.email,
        createdAt: new Date(),
      });
    }
    console.log("Utilisateur ajouté ou mis à jour dans Firestore avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout/mise à jour de l'utilisateur à Firestore :", error);
  }
};

// Fonction pour récupérer le prénom de l'utilisateur depuis Firestore
export const getUserName = async (uid: string) => {
  try {
    const userDoc = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const displayName = userSnapshot.data().displayName || "";
      console.log("Nom récupéré depuis Firestore :", displayName);
      return displayName;
    }
    console.log("Aucun document utilisateur trouvé pour l'UID :", uid);
    return "";
  } catch (error) {
    console.error("Erreur lors de la récupération du nom :", error);
    return "";
  }
};