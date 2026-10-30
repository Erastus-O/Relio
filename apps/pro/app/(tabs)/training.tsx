import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Card, ErrorText, H1, P, Pill, Screen } from "@/lib/ui";

interface Todo { course: string; mandatory: boolean; type: "new" | "refresher"; status: "overdue" | "expired" | "required" | "due_soon" | "assigned"; dueOn: string | null }
const label: Record<Todo["status"], [string, "bad" | "warn" | "info"]> = { overdue: ["Overdue", "bad"], expired: ["Expired", "bad"], required: ["Required", "bad"], due_soon: ["Due soon", "warn"], assigned: ["Assigned", "info"] };

/** Only the training still to do, marked as new training or a refresher. */
export default function Training() {
  const s = useSession();
  const t = useTheme();
  const [todo, setTodo] = useState<Todo[] | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "refresher">("all");
  const [err, setErr] = useState("");
  useFocusEffect(useCallback(() => { api<Todo[]>(`/pro/${s.proId}/training`).then(setTodo).catch((e) => setErr(e.message)); }, [s.proId]));
  const list = (todo ?? []).filter((x) => filter === "all" || x.type === filter);
  const n = (k: "new" | "refresher") => (todo ?? []).filter((x) => x.type === k).length;
  return (
    <Screen style={{ paddingTop: 56 }}>
      <H1>Training</H1>
      <P muted>{todo ? (todo.length ? `${todo.length} to do: ${n("new")} new, ${n("refresher")} refresher${n("refresher") === 1 ? "" : "s"}.` : "You’re up to date. Nothing to do right now.") : "Loading…"}</P>
      <ErrorText>{err}</ErrorText>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {(["all", "new", "refresher"] as const).map((k) => (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: filter === k }} onPress={() => setFilter(k)}
            style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: filter === k ? t.card : "transparent", borderWidth: 1, borderColor: filter === k ? t.line : "transparent", alignItems: "center" }}>
            <Text style={{ color: t.ink, fontWeight: filter === k ? "700" : "400" }}>{k === "all" ? "All" : k === "new" ? "New" : "Refresher"}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => x.course}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item: x }) => (
          <Card style={["overdue", "expired", "required"].includes(x.status) ? { borderLeftWidth: 3, borderLeftColor: t.bad } : undefined}>
            <Text style={{ color: t.ink, fontWeight: "600" }}>{x.course}</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <Pill label={x.type === "new" ? "New training" : "Refresher"} tone={x.type === "new" ? "info" : "warn"} />
              <Pill label={label[x.status][0]} tone={label[x.status][1]} />
              {x.mandatory && <P muted small>Mandatory</P>}
            </View>
            <P muted small>{x.dueOn ? `${x.status === "expired" ? "Expired" : x.status === "due_soon" ? "Renew by" : "Complete by"} ${new Date(x.dueOn).toLocaleDateString("en-GB")}` : "Not booked yet · speak to your manager"}</P>
          </Card>
        )}
      />
    </Screen>
  );
}
