import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20, // ajuda em telas estreitas
    gap: 15,
  },

  logo: {
    width: width * 0.55,   // 55% da largura da tela
    height: height * 0.18, // 18% da altura
    maxWidth: 260,         // limite opcional para tablets
    resizeMode: "contain",
    marginBottom: 15,
  },

  TextInput: {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 12,
    width: "85%",
    maxWidth: 400,
    padding: 12,
  },

  btn: {
    backgroundColor: "#6db5e8",
    paddingVertical: 12,
    paddingHorizontal: width * 0.13, // responsivo
    borderRadius: 15,
    elevation: 3,
    minWidth: 150,
    alignItems: "center",
  },

  btndb: {
    backgroundColor: "#fd3e03",
    paddingVertical: 10,
    paddingHorizontal: width * 0.10,
    borderRadius: 15,
    elevation: 3,
    minWidth: 150,
    alignItems: "center",
  },

  btntext: {
    fontSize: 15,
    color: "#fff",
  },

  btnregister: {
    fontSize: 15,
    padding: 10,
    textAlign: "center",
  },
});
