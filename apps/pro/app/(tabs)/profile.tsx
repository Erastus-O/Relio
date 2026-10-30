import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, H1, P, Pill } from "@/lib/ui";

interface Doc { id: string; kind: string; type: string; uploadedAt: string; expiresOn: string | null; state: "valid" | "expiring" | "expired" | "lapsed" | "renewal_pending"; renewBy?: string; daysLeft?: number; renewal: { status: string; note: string | null } | null }
const NAMES: Record<string, string> = { photo_id: "Photo ID", right_to_work: "Right to work", dbs: "DBS check", bank: "Bank details" };
const d = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function status(doc: Doc): [string, "good" | "warn" | "bad" | "info"] {
  switch (doc.state) {
    case "renewal_pending": return ["Renewal waiting for check", "info"];
    case "lapsed": return ["Expired · you’re inactive", "bad"];
    case "expired": return [`Expired · renew by ${doc.renewBy ? d(doc.renewBy) : "soon"}`, "bad"];
    case "expiring": return [`Expires in ${doc.daysLeft} days`, "warn"];
    default: return [doc.expiresOn ? `Valid until ${d(doc.expiresOn)}` : "No expiry", "good"];
  }
}

export default function Profile() {
  const s = useSession();
  const t = useTheme();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  useFocusEffect(useCallback(() => { api<Doc[]>(`/pro/${s.proId}/documents`).then(setDocs).catch((e) => setErr(e.message)); }, [s.proId]));
  const due = (docs ?? []).filter((x) => ["expired", "lapsed", "expiring"].includes(x.state) || x.renewal?.status === "rejected");
  const isOpen = open ?? due.length > 0;
  const inactive = (docs ?? []).some((x) => x.state === "lapsed");

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 14 }}>
      <H1>Profile</H1>
      <ErrorText>{err}</ErrorText>
      <Card>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpen(!isOpen)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: t.ink, fontWeight: "700", fontSize: 16 }}>My documents</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Pill label={inactive ? "Inactive" : due.length ? "Action needed" : "All valid"} tone={inactive ? "bad" : due.length ? "warn" : "good"} />
            <Text style={{ color: t.ink2 }}>{isOpen ? "▲" : "▼"}</Text>
          </View>
        </Pressable>
        {isOpen && (docs ?? []).map((doc) => {
          const [l, tone] = status(doc);
          const canRenew = ["expired", "lapsed", "expiring"].includes(doc.state) || doc.renewal?.status === "rejected";
          return (
            <View key={doc.id} style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 10, gap: 4 }}>
              <Text style={{ color: t.ink, fontWeight: "600" }}>{NAMES[doc.kind] ?? doc.kind}</Text>
              <P muted small>{doc.type} · uploaded {d(doc.uploadedAt)}</P>
              <Pill label={l} tone={tone} />
              {doc.renewal?.status === "rejected" && <P small style={{ color: t.bad }}>Renewal sent back: {doc.renewal.note}</P>}
              {canRenew && <Button kind={doc.state === "expiring" ? "light" : "dark"} title="Renew" onPress={() => router.push(`/renew/${doc.id}?kind=${doc.kind}`)} />}
            </View>
          );
        })}
        {isOpen && <P muted small>Only {s.businessName} can see these. When a document expires you have 5 days to upload a new one.</P>}
      </Card>
      <Card>
        <P>Signed in with <Text style={{ fontWeight: "700" }}>{s.email}</Text></P>
        <Button kind="light" title="Switch business" onPress={s.switchBusiness} />
        <Button kind="light" title="Sign out" onPress={s.signOut} />
      </Card>
    </ScrollView>
  );
}
