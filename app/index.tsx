import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../styles/loginregisterStyle";

export default function Index() {
  const db = useSQLiteContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await db.getAllAsync("SELECT * FROM users");
        console.log("Usuários no banco:", users);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }

    loadUsers();
  }, []);

  const handleLogin = async () => {
  try {
    const normalizedEmail = email.toLowerCase();

    const result = await db.getAllAsync(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [normalizedEmail, password]
    );

    console.log("Resultado: ", result);

    if (result.length === 0) {
      console.log("Email ou senha incorretos");
      alert("Email ou Senha Incorretos.");
      return;
    }

    await AsyncStorage.setItem("userSession", JSON.stringify(result[0]));
    router.replace("/tour");
  }
  catch(error){
    console.error("Erro no login: ", error);
    alert("Email ou Senha Incorretos.");
  }
};


  return (
      <View style={styles.container}>
        <Image style={styles.logo} source={require('../assets/img1.png')} resizeMode="contain" />
        <Text style={styles.btnregister}>Registre inúmeras viagens!</Text>
        <TextInput style={styles.TextInput} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.TextInput} placeholder="Senha" value={password} secureTextEntry onChangeText={setPassword}/>
        <TouchableOpacity style={styles.btn} onPress={handleLogin}><Text style={styles.btntext}>Entrar</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')}><Text style={styles.btnregister}>Novo Usuário? Cadastre-se</Text></TouchableOpacity>
      </View>
  );
}


