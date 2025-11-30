import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function Tour() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await AsyncStorage.getItem("userSession");
        
        if (!data) {
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
  }, []);

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
    <SafeAreaView style={styles.container}>
      <Image style={styles.logo} source={require('../assets/icon.png')} resizeMode="contain" />

      <Text style={styles.title}>Olá, {user.email}</Text>

      <View style={styles.row}>
        {/* Registrar Visita */}
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={() => router.push("/tour_register")}
        >
          <Text style={styles.bigBtnText}>
            Registrar{"\n"}Visita
          </Text>
        </TouchableOpacity>

        {/* Locais Visitados */}
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={() => router.push("/gallery")}
        >
          <Text style={styles.bigBtnText}>
            Locais{"\n"}Visitados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
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

  logo: {
    width: width * 0.45,
    height: height * 0.15,
    maxWidth: 200,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },

  bigBtn: {
    width: width * 0.38, 
    height: width * 0.33, 
    maxWidth: 170,
    maxHeight: 150,
    backgroundColor: "#6db5e8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    elevation: 3,
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
    paddingVertical: 14,
    width: width * 0.7, 
    maxWidth: 300,
    borderRadius: 20,
    elevation: 3,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
