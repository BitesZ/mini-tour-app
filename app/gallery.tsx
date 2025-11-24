import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, Modal, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Gallery() {
  const db = useSQLiteContext();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (!session) return;

      const user = JSON.parse(session);

      const results = await db.getAllAsync(
        "SELECT * FROM tours WHERE user_id = ? ORDER BY date DESC",
        [user.id]
      );

      setVisits(results);
    } catch (err) {
      console.error("Erro ao carregar visitas:", err);
    } finally {
      setLoading(false);
    }
  }

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
            await db.runAsync("DELETE FROM tours WHERE id = ?", [selectedId]);

            setModalVisible(false);
            loadData();
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
      {/* MODAL DE IMAGEM GRANDE */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} // <- FECHA NO BOTÃO VOLTAR
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Excluir Registro</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                setSelectedImage(item.photo_uri);
                setSelectedId(item.id);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.photo_uri }} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.description}>{item.description}</Text>

                <Text style={styles.textSmall}>
                  📍 Local: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
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
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 180,
  },

  info: {
    padding: 12,
  },

  description: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  textSmall: {
    color: "#555",
    marginBottom: 4,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "80%",
  },

  deleteBtn: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },

  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
