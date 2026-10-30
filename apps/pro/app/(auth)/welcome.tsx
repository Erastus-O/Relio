import { router } from "expo-router";
import { View } from "react-native";
import { Button, H1, P, Screen } from "@/lib/ui";

export default function Welcome() {
  return (
    <Screen style={{ justifyContent: "space-between", paddingTop: 96, paddingBottom: 40 }}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <H1>Pro</H1>
        <P muted>by Relio</P>
      </View>
      <View style={{ gap: 12 }}>
        <Button title="Continue with email" onPress={() => router.push("/(auth)/login")} />
        <P muted small style={{ textAlign: "center" }}>For professionals whose employer has added them on the platform. You can’t sign up on your own.</P>
      </View>
    </Screen>
  );
}
