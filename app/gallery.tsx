import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, Modal, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// FIRESTORE
import { db as fsDB } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function Gallery() {
  const db = useSQLiteContext();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [useRemoteDB, setUseRemoteDB] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // SQLite
  const [selectedFsId, setSelectedFsId] = useState(null); // Firestore

  useEffect(() => {
    loadMode();
  }, []);

  async function loadMode() {
    const mode = await AsyncStorage.getItem("selectedDBMode");
    setUseRemoteDB(mode === "remote");
    loadData(mode === "remote");
  }

  async function loadData(remoteMode) {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (!session) return;

      const user = JSON.parse(session);

      let results = [];

      //       MODO LOCAL (SQLite)
      
      if (!remoteMode) {
        results = await db.getAllAsync(
          "SELECT * FROM tours WHERE user_id = ? ORDER BY date DESC",
          [user.id]
        );
      }

      //       MODO REMOTO (FIRESTORE)

      else {
        const q = query(
          collection(fsDB, "tours"),
          where("user_id", "==", user.id),
          orderBy("date", "desc")
        );

        const snap = await getDocs(q);

        results = snap.docs.map((d) => ({
          ...d.data(),
          firestore_id: d.id, // necessário para deletar
        }));
      }

      setVisits(results);

    } catch (err) {
      console.error("Erro ao carregar visitas:", err);
    } finally {
      setLoading(false);
    }
  }

  //      EXCLUSÃO BASEADA NO MODO
  const handleDelete = async () => {
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (!useRemoteDB) {
                // SQLITE
                await db.runAsync("DELETE FROM tours WHERE id = ?", [selectedId]);
              } else {
                // FIRESTORE
                await deleteDoc(doc(fsDB, "tours", selectedFsId));
              }

              setModalVisible(false);
              loadData(useRemoteDB);

            } catch (e) {
              console.error("Erro ao excluir:", e);
            }
          },
        },
      ]
    );
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Carregando visitas...</Text>
      </View>
    );
  }

  if (visits.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhuma visita registrada ainda.</Text>
      </View>
    );
  }

  return (
    <>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />

          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Excluir Registro</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={visits}
          keyExtractor={(item, index) => {
            if (useRemoteDB) return item.firestore_id;
            return item.id.toString();
          }}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                setSelectedImage(item.photo_uri);
                setSelectedId(item.id ?? null);
                setSelectedFsId(item.firestore_id ?? null);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.photo_uri }} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.description}>{item.description}</Text>

                <Text style={styles.textSmall}>
                  📍 {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>

                <Text style={styles.textSmall}>📅 {formatDate(item.date)}</Text>
              </View>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#f7f7f7"
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: { 
    width: "100%", 
    height: 180,
  },

  info: { 
    padding: 14,
    gap: 6,
  },

  description: { 
    fontSize: 17, 
    fontWeight: "700", 
    marginBottom: 4,
    color: "#333",
  },

  textSmall: { 
    color: "#555", 
    fontSize: 14,
  },

  // modal
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.93)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  fullImage: { 
    width: "100%", 
    height: "75%",
    borderRadius: 14,
  },

  deleteBtn: {
    backgroundColor: "#ff4e4e",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 30,
    elevation: 6,
    shadowColor: "#ff0f0f",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { height: 4, width: 0 },
  },

  deleteBtnText: { 
    color: "#fff", 
    fontSize: 17, 
    fontWeight: "700",
    textAlign: "center",
  },
});