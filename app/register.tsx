import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { styles } from "../styles/loginregisterStyle";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const db = useSQLiteContext();

  function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const handleSave = async () => {
      
    const normalizedEmail = email.toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      alert("Email inválido!");
      return;
    }

    const exists = await db.getFirstAsync(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (exists) {
      alert("Este email já está cadastrado!");
      return;
    }

    await db.runAsync(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [normalizedEmail, password]
    );

    router.back();
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/img1.png')} resizeMode="contain" />
      <Text>Seja Bem-vindo(a)!</Text>

      <TextInput style={styles.TextInput} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.TextInput} placeholder="Senha" value={password} secureTextEntry onChangeText={setPassword}/>

      <TouchableOpacity style={styles.btn} onPress={handleSave}><Text style={styles.btntext}>Cadastrar</Text></TouchableOpacity>
    </View>
  );
}
