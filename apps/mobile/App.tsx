import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Phase 1</Text>
        <Text style={styles.title}>EHC mobile foundation</Text>
        <Text style={styles.body}>
          Patient-friendly onboarding, tenant-aware access, and facility-first
          healthcare workflows will start from this shell.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#194898",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#EDEDEE",
    padding: 24,
  },
  eyebrow: {
    color: "#5084D9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    color: "#194898",
    fontSize: 28,
    fontWeight: "700",
  },
  body: {
    marginTop: 12,
    color: "#334155",
    fontSize: 16,
    lineHeight: 24,
  },
});

