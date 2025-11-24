import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Calendar from "expo-calendar";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";

export default function tour_register() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [location, setLocation] = useState(null);

  const [description, setDescription] = useState("");

  const db = useSQLiteContext();

  // Tirar foto
  const handleTakePhoto = async () => {
    const { granted } = await requestPermission();
    if (!granted) return;

    setIsTakingPhoto(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    const img = await cameraRef.current.takePictureAsync();
    setPhoto(img.uri);
    setIsTakingPhoto(false);
  };

  // Pegar localização
  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Ative a localização nas configurações.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error("Erro ao pegar localização:", error);
      Alert.alert("Erro", "Não foi possível pegar a localização.");
    }
  };

  // Criar evento no calendário
  const saveToCalendar = async (description) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Erro", "Permissão ao calendário negada.");
        return null;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const editable = calendars.find(c => c.allowsModifications);

      if (!editable) {
        Alert.alert("Erro", "Nenhum calendário disponível para criar eventos.");
        return null;
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const eventId = await Calendar.createEventAsync(editable.id, {
        title: `Visita: ${description}`,
        startDate,
        endDate,
        timeZone: "America/Sao_Paulo",
        notes: "Criado automaticamente pelo Mini-Tour",
      });

      return eventId;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      Alert.alert("Erro ao criar evento:", String(error));
      return null;
    }
  };

  // Salvar registro no BD
  const handleSave = async () => {
    if (!photo) return Alert.alert("Erro", "Tire uma foto.");
    if (!location) return Alert.alert("Erro", "Pegue a localização.");
    if (!description.trim()) return Alert.alert("Erro", "Digite uma descrição.");

    const session = await AsyncStorage.getItem("userSession");
    if (!session) return Alert.alert("Erro", "Usuário não encontrado.");

    const user = JSON.parse(session);
    const user_id = user.id;

    const date = new Date().toISOString();
    await saveToCalendar(description);

    await db.runAsync(
      `INSERT INTO tours (user_id, photo_uri, latitude, longitude, description, date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, photo, location.latitude, location.longitude, description, date]
    );

    Alert.alert("Sucesso", "Registro salvo!");
    router.replace("/tour");
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {photo ? (
        <Image source={{ uri: photo }} style={styles.preview} />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text style={{ color: "#777" }}>Nenhuma foto</Text>
        </View>
      )}

      {/* Tela de câmera */}
      {isTakingPhoto && (
        <View style={styles.cameraFullScreen}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing="back"
          />

          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsTakingPhoto(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleTakePhoto}>
        <Text style={styles.btnText}>Tirar Foto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleGetLocation}>
        <Text style={styles.btnText}>Pegar Localização Atual</Text>
      </TouchableOpacity>

      {location && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker coordinate={location} />
        </MapView>
      )}

      <TextInput
        placeholder="Descrição da visita"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Salvar Registro</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f7f7f7",
    gap: 16,
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  previewPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#e6e6e6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#bbb",
  },

  map: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  btn: {
    backgroundColor: "#6db5e8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  saveBtn: {
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    marginTop: 8,
  },

  saveBtnText: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "700",
  },

  cameraFullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 999,
  },

  cameraPreview: {
    flex: 1,
    width: "100%",
  },

  cameraControls: {
    width: "100%",
    paddingBottom: 50,
    alignItems: "center",
  },

  captureBtn: {
    width: 75,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 40,
    borderWidth: 6,
    borderColor: "#ddd",
  },

  cancelBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },

  cancelText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});
