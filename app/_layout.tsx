import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="tour.db" onInit={initDB}>
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="index" options={{ title: "Login" }} />
            <Stack.Screen name="register" options={{ title: "Cadastro"}} />
            <Stack.Screen name="tour" options={{ title: "Tela Principal" }}/>
            <Stack.Screen name="tour_register" options={{ title: "Registro de Visita" }}/>
            <Stack.Screen name="gallery" options={{ title: "Galeria de Locais Visitados"}}/>
          </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

// Função que cria as tabelas
async function initDB(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      photo_uri TEXT,
      latitude REAL,
      longitude REAL,
      description TEXT,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
