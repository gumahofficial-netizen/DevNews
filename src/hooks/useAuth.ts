import { useState, useEffect } from "react";
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "../services/firebase";
import { UserProfile, UserRole } from "../types";
import { createUserWithEmailAndPassword } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          // Fetch user profile from firestore
          const docRef = doc(db, "Users", fUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (fUser.email === "admin@gumah.com" || fUser.email === "gumahofficial@gmail.com") {
              if (data.role !== "Admin") {
                data.role = "Admin";
                await setDoc(docRef, { role: "Admin" }, { merge: true });
              }
            }
            setUser(data);
          } else {
            // First time sign-in / custom user created outside standard signup, or we seed a profile
            const isFirstUser = fUser.email === "gumahofficial@gmail.com" || fUser.email === "admin@gumah.com" || fUser.email?.startsWith("admin");
            const assignedRole: UserRole = isFirstUser ? "Admin" : "User";
            
            const newProfile: UserProfile = {
              uid: fUser.uid,
              email: fUser.email || "",
              displayName: fUser.displayName || fUser.email?.split("@")[0] || "User",
              role: assignedRole,
              bookmarks: [],
              history: [],
              savedArticles: [],
              createdAt: new Date().toISOString()
            };
            
            await setDoc(docRef, newProfile);
            setUser(newProfile);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string, role: UserRole = "User") => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: email,
        displayName: displayName,
        role: role,
        bookmarks: [],
        history: [],
        savedArticles: [],
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "Users", cred.user.uid), newProfile);
      setUser(newProfile);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileFields = async (fields: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    await setDoc(doc(db, "Users", user.uid), updated);
    setUser(updated);
  };

  return {
    user,
    firebaseUser,
    loading,
    loginWithEmail,
    registerWithEmail,
    logout,
    resetPassword,
    updateProfileFields
  };
}
