import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Tour() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadSession() {
            try {
                const data = await AsyncStorage.getItem("userSession");
                
                if(!data) {
                    router.replace("/");
                    return;
                }

                setUser(JSON.parse(data));
            }
            catch (error) {
                console.error("Erro ao carregar sessão:", error);
            }
        }
        loadSession();
    },[]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("userSession");
        router.replace("/");
    };

    if (!user) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }


  return (
  <View style={styles.container}>
    <Text style={styles.title}>Olá, {user.email}</Text>

    {/* Linha com 2 botões grandes */}
    <View style={styles.row}>
      <TouchableOpacity style={[styles.bigBtn]}
        onPress={() => router.push("/tour_register")}
      >
        <Text style={styles.bigBtnText}>Registrar{"\n"}Visita</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.bigBtn]}
        onPress={() => router.push("/gallery")}
      >
        <Text style={styles.bigBtnText}>Locais{"\n"}Visitados</Text>
      </TouchableOpacity>
    </View>

    {/* Botão logout grande */}
    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 20,
  },

  bigBtn: {
    width: 140,
    height: 120,
    backgroundColor: "#6db5e8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    elevation: 3
  },

  bigBtnText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#ff5252",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    elevation: 3
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
