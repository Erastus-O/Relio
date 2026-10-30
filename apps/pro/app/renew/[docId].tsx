import { useState } from "react";
import { Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { api, appendImage } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Button, ErrorText, Field, H1, P, Screen } from "@/lib/ui";

export default function Renew() {
  const s = useSession();
  const { docId, kind } = useLocalSearchParams<{ docId: string; kind: string }>();
  const [uri, setUri] = useState<string | null>(null);
  const [expires, setExpires] = useState("");
  const [cert, setCert] = useState("");
  const [issued, setIssued] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const dbs = kind === "dbs";

  async function pick(camera: boolean) {
    const r = camera ? await ImagePicker.launchCameraAsync({ quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!r.canceled) setUri(r.assets[0].uri);
  }
  async function send() {
    setErr("");
    if (!uri) return setErr("Add the new document.");
    const f = new FormData();
    appendImage(f, "file", uri);
    if (dbs) { f.append("certificate", cert.replace(/\s/g, "")); f.append("issuedOn", issued); } else if (expires) f.append("expiresOn", expires);
    setBusy(true);
    try {
      await api(`/pro/${s.proId}/documents/${docId}/renewal`, { form: f });
      router.back();
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Screen style={{ paddingTop: 56 }}>
      <Button kind="light" title="← Profile" onPress={() => router.back()} />
      <H1>Renew document</H1>
      {uri ? <Image source={{ uri }} style={{ width: "100%", height: 180, borderRadius: 12 }} accessibilityLabel="New document" /> : <P muted>Take a photo of the new document or choose a file.</P>}
      <Button kind="light" title="Take a photo" onPress={() => pick(true)} />
      <Button kind="light" title="Choose from library" onPress={() => pick(false)} />
      {dbs ? (
        <>
          <Field label="Certificate number (12 digits)" value={cert} onChangeText={setCert} keyboardType="number-pad" />
          <Field label="Issue date (YYYY-MM-DD)" value={issued} onChangeText={setIssued} />
        </>
      ) : <Field label={kind === "right_to_work" ? "Permission ends (leave empty if not time-limited)" : "Expiry date (YYYY-MM-DD)"} value={expires} onChangeText={setExpires} />}
      <ErrorText>{err}</ErrorText>
      <Button title={`Send to ${s.businessName ?? "your employer"}`} onPress={send} busy={busy} />
      <P muted small>Sending it pauses the 5-day countdown while your employer checks it.</P>
    </Screen>
  );
}
