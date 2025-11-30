// services/AuthService.js
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db as firestoreDb } from "../firebaseConfig"; // ajusta se teu export for diferente

// ----------------------------
// LOCAL (SQLite)
// ----------------------------
// Recebe o db (expo-sqlite provider) como primeiro argumento
export async function registerLocalUser(db, email, password) {
  // db é o objeto retornado por useSQLiteContext()
  return db.runAsync(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  );
}

// ----------------------------
// REMOTE (FIRESTORE)
// ----------------------------

// Verifica se já existe um usuário com esse email na coleção "users"
export async function checkRemoteEmailExists(email) {
  const usersRef = collection(firestoreDb, "users");
  const q = query(usersRef, where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}

// Registra usuário no Firestore (coleção "users")
// OBS: esse exemplo salva a senha em texto simples para manter a paridade com o SQLite.
// Se quiser, depois trocamos para hash ou usar Firebase Auth proper.
export async function registerRemoteUser(email, password) {
  const usersRef = collection(firestoreDb, "users");
  const docRef = await addDoc(usersRef, {
    email,
    password,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, email };
}