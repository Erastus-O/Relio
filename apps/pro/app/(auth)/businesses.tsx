import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, H1, P, Pill, Screen } from "@/lib/ui";

interface Link { proId: string; business: { id: string; name: string }; role: string; status: "active" | "invited" | "removed"; setupDone: boolean }

/** Every business that has added this email. Shown straight after email + code sign-in. */
export default function Businesses() {
  const s = useSession();
  const t = useTheme();
  const [list, setList] = useState<Link[] | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => { api<Link[]>("/pro/businesses").then(setList).catch((e) => setErr(e.message)); }, []);
  useFocusEffect(load);

  async function accept(l: Link) {
    try { await api(`/pro/${l.proId}/accept`, { method: "POST" }); load(); } catch (e) { setErr((e as Error).message); }
  }

  return (
    <Screen style={{ paddingTop: 64 }}>
      <H1>Your businesses</H1>
      <P muted>{list ? `${list.length} business${list.length === 1 ? " has" : "es have"} added ${s.email}. Choose one to continue.` : "Loading…"}</P>
      <ErrorText>{err}</ErrorText>
      {list && list.length === 0 && <P>We couldn’t find a business that has added this email. Ask your employer to add you, then sign in with the email they used.</P>}
      <FlatList
        data={list ?? []}
        keyExtractor={(l) => l.proId}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item: l }) => (
          <Card style={{ flexDirection: "row", alignItems: "center", opacity: l.status === "removed" ? 0.55 : 1 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.dark, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: t.onDark, fontWeight: "700" }}>{l.business.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.ink, fontWeight: "600", fontSize: 15 }}>{l.business.name}</Text>
              <P muted small>{l.role}</P>
              {l.status === "active" ? <Pill label={l.setupDone ? "Active" : "Finish your setup"} tone={l.setupDone ? "good" : "warn"} /> : l.status === "invited" ? <Pill label="Invited" tone="info" /> : <Pill label="Access removed" tone="bad" />}
            </View>
            {l.status === "active" && <Button title="Open" onPress={() => s.choose(l.proId, l.business.name, l.setupDone)} />}
            {l.status === "invited" && <Button kind="light" title="Accept" onPress={() => accept(l)} />}
          </Card>
        )}
      />
      <Button kind="light" title="Sign out" onPress={s.signOut} />
    </Screen>
  );
}
