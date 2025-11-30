import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export async function saveTourRemote(tour) {
  try {
    await addDoc(collection(db, "tours"), tour);
    return true;
  } catch (error) {
    console.error("Erro ao salvar tour no Firestore:", error);
    return false;
  }
}