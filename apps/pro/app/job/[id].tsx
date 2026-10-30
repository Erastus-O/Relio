import { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ApiError, api, appendImage, photoUrl } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, H1, P, Pill } from "@/lib/ui";

interface Photo { id: string; url: string; takenAt: string; fromCustomer?: boolean }
interface Task { id: string; name: string; result: "done" | "not_done" | "na" | null; reason: string | null; custom: boolean; requiredPhotos: ("before" | "after")[]; before: Photo[]; after: Photo[] }
interface Job {
  id: string; state: string; startsAt: string; endsAt: string; service: string; site: { label: string; address: string }; photoPermission: "allowed" | "none";
  checkinAt: string | null; access: { notes: string | null; secret: string | null; unlocksAt: string }; customerPhotos: Photo[]; rooms: { room: string; tasks: Task[] }[];
}

export default function JobScreen() {
  const s = useSession();
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [err, setErr] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const base = `/pro/${s.proId}/visits/${id}`;
  const load = useCallback(() => { api<Job>(base).then(setJob).catch((e) => setErr(e.message)); }, [base]);
  useFocusEffect(load);

  const locked = job ? ["submitted", "completed", "partial"].includes(job.state) : true;

  async function checkin() {
    try { await api(`${base}/checkin`, { json: { method: "qr" } }); load(); } catch (e) { setErr((e as Error).message); }
  }
  async function result(task: Task, r: Task["result"], reason?: string) {
    try { await api(`${base}/tasks/${task.id}`, { method: "PATCH", json: { result: r, reason } }); load(); } catch (e) { setErr((e as Error).message); }
  }
  async function addPhoto(task: Task, kind: "before" | "after") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    const r = perm.granted ? await ImagePicker.launchCameraAsync({ quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (r.canceled) return;
    const f = new FormData();
    appendImage(f, "photo", r.assets[0].uri);
    f.append("kind", kind);
    f.append("takenAt", new Date().toISOString());
    try { await api(`${base}/tasks/${task.id}/photos`, { form: f }); load(); } catch (e) { setErr((e as Error).message); }
  }
  async function submit() {
    setProblems([]);
    try { await api(`${base}/submit`, { method: "POST" }); Alert.alert("Submitted", "Your supervisor will check it."); load(); } catch (e) {
      const x = e as ApiError;
      setErr(x.message);
      setProblems(x.details?.problems ?? []);
    }
  }

  if (!job) return <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, paddingTop: 56 }}><P>{err || "Loading…"}</P></View>;
  const allowed = job.photoPermission === "allowed";
  const thumb = (p: Photo, label: string) => (
    <View key={p.id} style={{ gap: 2 }}>
      <Image source={photoUrl(p.url)} style={{ width: 96, height: 72, borderRadius: 8, backgroundColor: t.line }} accessibilityLabel={`${label} photo`} />
      <P muted small>{p.fromCustomer ? "Customer" : label}</P>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 14 }}>
      <Button kind="light" title="← Back" onPress={() => router.back()} />
      <View><H1>{job.site.label}</H1><P muted>{job.site.address} · {job.service}</P></View>
      <Card>
        <P muted small>ACCESS</P>
        {job.access.secret ? <><P>{job.access.notes}</P><Text style={{ color: t.ink, fontWeight: "700", fontSize: 18 }}>{job.access.secret}</Text><P muted small>Shown during your visit window only.</P></> : <P muted>Access details unlock at {new Date(job.access.unlocksAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.</P>}
      </Card>
      {job.customerPhotos.length > 0 && (
        <Card><P muted small>CUSTOMER’S PHOTOS</P><View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{job.customerPhotos.map((p) => thumb(p, "Before"))}</View></Card>
      )}
      {!job.checkinAt ? <Button title="Check in" onPress={checkin} /> : (
        <>
          {!allowed && <Card><P>The customer asked for no photos. Your checklist plus supervisor confirmation is the evidence.</P></Card>}
          {job.rooms.map((r) => {
            const done = r.tasks.filter((x) => x.result).length;
            return (
              <Card key={r.room}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}><P muted small>{r.room.toUpperCase()}</P><P small muted>{done}/{r.tasks.length}</P></View>
                {r.tasks.map((task) => {
                  const missing = task.requiredPhotos.filter((k) => !(k === "before" ? task.before.length : task.after.length));
                  return (
                    <View key={task.id} style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 10, gap: 8 }}>
                      <Text style={{ color: t.ink }}>{task.name}{task.requiredPhotos.length ? <Text style={{ color: t.ink2, fontSize: 12 }}> · {task.requiredPhotos.join(" + ")} photo needed</Text> : null}{task.custom ? <Text style={{ color: t.ink2, fontSize: 12 }}> · added by customer</Text> : null}</Text>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {(["done", "not_done", "na"] as const).map((k) => (
                          <Pressable key={k} disabled={locked} accessibilityRole="button" accessibilityState={{ selected: task.result === k }}
                            onPress={() => (k === "not_done" ? (setReasonFor(task.id), setReason(task.reason ?? "")) : result(task, k))}
                            style={{ flex: 1, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: task.result === k ? t.ink : t.line, backgroundColor: task.result === k ? (k === "done" ? t.goodSoft : k === "not_done" ? t.badSoft : t.bg) : t.card, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ color: t.ink, fontWeight: "600" }}>{k === "done" ? "Done" : k === "not_done" ? "Not done" : "N/A"}</Text>
                          </Pressable>
                        ))}
                      </View>
                      {reasonFor === task.id && (
                        <View style={{ gap: 6 }}>
                          <TextInput value={reason} onChangeText={setReason} placeholder="Why wasn’t it done? (required)" placeholderTextColor={t.ink3} accessibilityLabel="Reason" style={{ borderWidth: 1, borderColor: t.line, borderRadius: 10, padding: 10, color: t.ink, backgroundColor: t.card }} />
                          <Button kind="light" title="Save as not done" disabled={reason.trim().length < 3} onPress={() => { result(task, "not_done", reason.trim()); setReasonFor(null); }} />
                        </View>
                      )}
                      {task.reason && reasonFor !== task.id && <P muted small>Reason: {task.reason}</P>}
                      {allowed && (
                        <>
                          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{task.before.map((p) => thumb(p, "Before"))}{task.after.map((p) => thumb(p, "After"))}</View>
                          {!locked && task.before.length + task.after.length < 4 && (
                            <View style={{ flexDirection: "row", gap: 8 }}>
                              {(missing.length ? missing : (["after"] as const)).map((k) => <View key={k} style={{ flex: 1 }}><Button kind={missing.length ? "brand" : "light"} title={missing.length ? `Add ${k} photo` : "Add photo"} onPress={() => addPhoto(task, k)} /></View>)}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
              </Card>
            );
          })}
          <ErrorText>{err}</ErrorText>
          {problems.map((p) => <P key={p} small style={{ color: t.bad }}>• {p}</P>)}
          {!locked ? <Button kind="brand" title="Check out and submit" onPress={submit} /> : <Pill label="Submitted for review" tone="good" />}
        </>
      )}
    </ScrollView>
  );
}

