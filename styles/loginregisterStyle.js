import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  TextInput: {
    backgroundColor: '#ffffffff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 15,
    width: "75%",
    padding: 10
  },
  logo: {
    width: "50%",
    height: "19%"
  },
  btn: {
    backgroundColor: "#6db5e8",
    padding: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
    elevation: 3,
  },
  btntext: {
    fontSize: 15,
    color: "#fff",
  },
  btnregister: {
    fontSize: 15,
    padding: 10
  }
});