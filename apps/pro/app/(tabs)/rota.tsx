import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, H1, P, Pill, Screen } from "@/lib/ui";

interface Row { id: string; startsAt: string; endsAt: string; state: string; site: string; service: string }
const hm = (s: string) => new Date(s).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const day = (s: string) => new Date(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

export default function Rota() {
  const s = useSession();
  const t = useTheme();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  useFocusEffect(useCallback(() => { api<Row[]>(`/pro/${s.proId}/visits`).then(setRows).catch((e) => setErr(e.message)); }, [s.proId]));
  const today = new Date().toDateString();
  const todays = (rows ?? []).filter((r) => new Date(r.startsAt).toDateString() === today);
  const next = todays.find((r) => ["scheduled", "in_progress"].includes(r.state));
  return (
    <Screen style={{ paddingTop: 56 }}>
      <H1>My rota</H1>
      <ErrorText>{err}</ErrorText>
      {next && (
        <Card style={{ borderColor: t.brand }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}><P muted small>NEXT VISIT</P><Pill label={next.state === "in_progress" ? "In progress" : "Scheduled"} tone="info" /></View>
          <Text style={{ color: t.ink, fontSize: 22, fontWeight: "700" }}>{hm(next.startsAt)}–{hm(next.endsAt)}</Text>
          <P>{next.site} · {next.service}</P>
          <Button kind="brand" title={next.state === "in_progress" ? "Continue job" : "Open job"} onPress={() => router.push(`/job/${next.id}`)} />
        </Card>
      )}
      <P muted small style={{ textTransform: "uppercase", letterSpacing: 1 }}>Your week</P>
      <FlatList
        data={rows ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={rows ? <P muted>No shifts published for this week yet.</P> : <P muted>Loading…</P>}
        renderItem={({ item: r }) => (
          <Pressable accessibilityRole="button" onPress={() => router.push(`/job/${r.id}`)}>
            <Card>
              <P muted small>{day(r.startsAt)}</P>
              <Text style={{ color: t.ink, fontWeight: "600" }}>{hm(r.startsAt)}–{hm(r.endsAt)} · {r.site}</Text>
              <P muted small>{r.service} · {r.state.replace("_", " ")}</P>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
