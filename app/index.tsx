import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../styles/loginregisterStyle";

//Firestore
import { db } from "../firebaseConfig"; 
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Index() {
  const dbLocal = useSQLiteContext();
  const [useRemoteDB, setUseRemoteDB] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function loadInitialState() {
      try {
        // Carregar modo de banco
        const savedMode = await AsyncStorage.getItem("selectedDBMode");
        if (savedMode) {
          setUseRemoteDB(savedMode === "remote");
        }

        // Verificar se usuário já está logado
        const session = await AsyncStorage.getItem("userSession");
        if (session) {
          router.replace("/tour"); 
        }
      } catch (error) {
        console.error("Erro ao carregar estado inicial:", error);
      }
    }

    loadInitialState();
  }, []);

  // Alternar banco
  const toggleDB = async () => {
    const newMode = !useRemoteDB;
    setUseRemoteDB(newMode);

    await AsyncStorage.setItem("selectedDBMode", newMode ? "remote" : "local");
  };
  // (SQLite)
  async function loginLocal() {
    const normalizedEmail = email.toLowerCase();

    const result = await dbLocal.getAllAsync(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [normalizedEmail, password]
    );

    if (result.length === 0) {
      alert("Email ou senha incorretos.");
      return false;
    }

    await AsyncStorage.setItem("userSession", JSON.stringify(result[0]));
    return true;
  }

  // (Firestore)
  async function loginRemote() {
  const normalizedEmail = email.toLowerCase();

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", normalizedEmail), where("password", "==", password));
  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Email ou senha incorretos.");
    return false;
  }

  const doc = snap.docs[0];

  const userData = {
    id: doc.id,
    ...doc.data()
  };

  await AsyncStorage.setItem("userSession", JSON.stringify(userData));

  return true;
}

  const handleLogin = async () => {
    try {
      const logged = useRemoteDB ? await loginRemote() : await loginLocal();
      if (logged) router.replace("/tour");
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Não foi possível fazer login.");
    }
  };


  return (
      <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/img1.png')} resizeMode="contain" />

      {/* BOTÃO DE TROCA DE BANCO */}
      <TouchableOpacity style={styles.btndb} onPress={toggleDB}>
        <Text style={styles.btntext}>
          Banco atual: {useRemoteDB ? "🌐 Remoto (Firestore)" : "📁 Local (SQLite)"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.btnregister}>Registre inúmeras viagens!</Text>

      <TextInput 
        style={styles.TextInput} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
      />

      <TextInput 
        style={styles.TextInput} 
        placeholder="Senha" 
        value={password} 
        secureTextEntry 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btntext}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.btnregister}>Novo Usuário? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}


