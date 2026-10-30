import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, H1, P, gbp } from "@/lib/ui";

interface Home {
  earnedThisPeriod: { gross: number; hours: number; from: string; to: string } | null;
  nextPay: { net: number; payOn: string; status: string } | null;
  paidThisTaxYear: number;
  balance: number;
  nextVisit: { id: string; startsAt: string; endsAt: string; site: string } | null;
  inactive: boolean;
  documentAlerts: { kind: string; state: string; renewBy?: string }[];
}
const day = (s: string) => new Date(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const hm = (s: string) => new Date(s).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function HomeTab() {
  const s = useSession();
  const t = useTheme();
  const [h, setH] = useState<Home | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(() => {
    setLoading(true);
    api<Home>(`/pro/${s.proId}/home`).then(setH).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [s.proId]);
  useFocusEffect(load);

  const daysTo = h?.nextPay ? Math.max(0, Math.round((new Date(h.nextPay.payOn).getTime() - Date.now()) / 864e5)) : 0;
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 14 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <P muted small>{s.businessName}</P>
      <H1>Home</H1>
      <ErrorText>{err}</ErrorText>
      {h && (
        <>
          <View style={{ backgroundColor: "#2a211b", borderRadius: 18, padding: 16, gap: 12 }}>
            <Text style={{ color: "#ffffffb8", fontSize: 13 }}>Earned so far this pay period</Text>
            <Text style={{ color: "#fff", fontSize: 34, fontWeight: "700" }}>{gbp(h.earnedThisPeriod?.gross ?? 0)}</Text>
            {h.earnedThisPeriod && <Text style={{ color: "#ffffffb8", fontSize: 12.5 }}>{h.earnedThisPeriod.hours} hrs · {day(h.earnedThisPeriod.from)} to {day(h.earnedThisPeriod.to)} · before tax</Text>}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: "#ffffff14", borderRadius: 12, padding: 10 }}>
                <Text style={{ color: "#ffffffb8", fontSize: 12 }}>Next pay</Text>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{h.nextPay ? gbp(h.nextPay.net) : "–"}</Text>
                {h.nextPay && <Text style={{ color: "#ffffffb8", fontSize: 12 }}>{day(h.nextPay.payOn)} · in {daysTo} day{daysTo === 1 ? "" : "s"}</Text>}
              </View>
              <View style={{ flex: 1, backgroundColor: "#ffffff14", borderRadius: 12, padding: 10 }}>
                <Text style={{ color: "#ffffffb8", fontSize: 12 }}>Paid this tax year</Text>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{gbp(h.paidThisTaxYear)}</Text>
                <Text style={{ color: "#ffffffb8", fontSize: 12 }}>After tax</Text>
              </View>
            </View>
            <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View><Text style={{ color: "#6b7280", fontSize: 12 }}>Available to withdraw</Text><Text style={{ color: "#141414", fontSize: 20, fontWeight: "700" }}>{gbp(h.balance)}</Text></View>
              <Button kind="brand" title="Withdraw" onPress={() => router.push("/withdraw")} disabled={h.balance < 100} />
            </View>
          </View>

          <P muted small style={{ textTransform: "uppercase", letterSpacing: 1 }}>Today</P>
          {h.nextVisit ? (
            <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/rota")}>
              <Card style={{ borderColor: t.brand }}>
                <Text style={{ color: t.ink, fontWeight: "700", fontSize: 16 }}>Next visit · {hm(h.nextVisit.startsAt)}–{hm(h.nextVisit.endsAt)}</Text>
                <P muted>{h.nextVisit.site}</P>
                <Text style={{ color: t.brand, fontWeight: "600" }}>View in My rota ›</Text>
              </Card>
            </Pressable>
          ) : <P muted>No shift assigned today.</P>}

          {h.inactive && (
            <Card style={{ backgroundColor: t.badSoft, borderColor: t.bad }}>
              <P><Text style={{ fontWeight: "700" }}>You’re inactive, so you won’t get new jobs.</Text> A document expired more than 5 days ago. Renew it to become active again.</P>
              <Button title="Renew now" onPress={() => router.push("/(tabs)/profile")} />
            </Card>
          )}
          {!h.inactive && h.documentAlerts.filter((a) => a.state === "expired").map((a) => (
            <Card key={a.kind} style={{ backgroundColor: t.warnSoft, borderColor: t.warn }}>
              <P><Text style={{ fontWeight: "700" }}>Your {a.kind.replace(/_/g, " ")} has expired.</Text> Renew it by {a.renewBy ? day(a.renewBy) : "soon"} or you’ll become inactive.</P>
              <Button kind="light" title="Renew" onPress={() => router.push("/(tabs)/profile")} />
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}
