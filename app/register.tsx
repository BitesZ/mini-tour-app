import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles/loginregisterStyle";
import { registerLocalUser, registerRemoteUser, checkRemoteEmailExists } from "../services/AuthService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dbLocal = useSQLiteContext();
  const [useRemoteDB, setUseRemoteDB] = useState(false);

  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem("selectedDBMode");
      if (savedMode) {
        setUseRemoteDB(savedMode === "remote");
      }
    })();
  }, []);

  function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const handleSave = async () => {
    const normalizedEmail = email.toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      Alert.alert("Email inválido!");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Digite uma senha!");
      return;
    }

    if (useRemoteDB) {
      // FIRESTORE
      const existsRemote = await checkRemoteEmailExists(normalizedEmail);
      if (existsRemote) {
        Alert.alert("Este email já está cadastrado no banco remoto!");
        return;
      }

      await registerRemoteUser(normalizedEmail, password);
      Alert.alert("Usuário criado no Firebase!");
      router.back();
      return;
    }

    // SQLITE LOCAL
    const existsLocal = await dbLocal.getFirstAsync(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existsLocal) {
      Alert.alert("Este email já está cadastrado no banco local!");
      return;
    }

    await registerLocalUser(dbLocal, normalizedEmail, password);

    Alert.alert("Usuário cadastrado com sucesso!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/img1.png')} resizeMode="contain" />

      <Text style={{ fontSize: 16 }}>Seja Bem-vindo(a)!</Text>

      <TextInput
        style={styles.TextInput}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.TextInput}
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btntext}>Cadastrar</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 10 }}>
        Usando banco: {useRemoteDB ? "🔥 Remoto (Firebase)" : "🟦 Local (SQLite)"}
      </Text>
    </View>
  );
}
