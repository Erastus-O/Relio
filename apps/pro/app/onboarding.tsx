import { useState } from "react";
import { ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Button, Card, ErrorText, Field, H1, P, Screen } from "@/lib/ui";

const STEPS = ["about", "experience", "rtw", "dbs", "pay", "availability", "contract", "done"] as const;
const TITLES: Record<(typeof STEPS)[number], string> = {
  about: "About you", experience: "Experience and skills", rtw: "Photo ID and right to work", dbs: "DBS check", pay: "Pay", availability: "Availability", contract: "Contract and policies", done: "Check and send",
};

/** Pro onboarding. Each step is saved; the business verifies ID, right to work, DBS and bank details before any jobs are offered. */
export default function Onboarding() {
  const s = useSession();
  const [i, setI] = useState(0);
  const [d, setD] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const step = STEPS[i];
  const set = (k: string) => (v: string) => setD((x) => ({ ...x, [k]: v }));

  async function pickId() {
    const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!r.canceled) set("idPhoto")(r.assets[0].uri);
  }

  function check(): string {
    if (step === "about" && (!d.emergencyName || !d.emergencyPhone)) return "Add an emergency contact.";
    if (step === "rtw" && (!d.idPhoto || !d.idExpires)) return "Add a photo of your ID and its expiry date.";
    if (step === "dbs" && d.dbsCert && !/^\d{12}$/.test(d.dbsCert)) return "DBS certificate numbers have 12 digits.";
    if (step === "pay" && (!/^\d{2}-?\d{2}-?\d{2}$/.test(d.sortCode ?? "") || !/^\d{8}$/.test(d.account ?? ""))) return "Enter a 6-digit sort code and 8-digit account number.";
    if (step === "contract" && (d.signature ?? "").trim().length < 3) return "Type your full name to sign.";
    return "";
  }

  async function next() {
    const e = check();
    if (e) return setErr(e);
    setErr("");
    try {
      // Document photos are uploaded separately in production; this saves the answers for each step.
      await api(`/pro/${s.proId}/onboarding`, { json: { step, data: Object.fromEntries(Object.entries(d).filter(([k]) => k !== "idPhoto" && k !== "account")) } });
      if (step === "done") s.finishSetup();
      else setI(i + 1);
    } catch (x) { setErr((x as Error).message); }
  }

  return (
    <Screen style={{ paddingTop: 56 }}>
      <P muted small>Step {i + 1} of {STEPS.length} · {s.businessName}</P>
      <H1>{TITLES[step]}</H1>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {step === "about" && <><Field label="Preferred name" value={d.preferred} onChangeText={set("preferred")} /><Field label="Emergency contact name" value={d.emergencyName} onChangeText={set("emergencyName")} /><Field label="Emergency contact phone" value={d.emergencyPhone} onChangeText={set("emergencyPhone")} keyboardType="phone-pad" /></>}
        {step === "experience" && <Field label="Years of experience" value={d.years} onChangeText={set("years")} keyboardType="number-pad" />}
        {step === "rtw" && <><Card><P>Passport or UK driving licence</P><Button kind="light" title={d.idPhoto ? "Photo added · retake" : "Take a photo"} onPress={pickId} /></Card><Field label="ID expiry date (YYYY-MM-DD)" value={d.idExpires} onChangeText={set("idExpires")} /><Field label="Share code, if you have one" value={d.shareCode} onChangeText={set("shareCode")} autoCapitalize="characters" /></>}
        {step === "dbs" && <><P muted small>If you don’t have a DBS certificate, leave this blank and your employer will apply for one.</P><Field label="Certificate number" value={d.dbsCert} onChangeText={set("dbsCert")} keyboardType="number-pad" /><Field label="Issue date (YYYY-MM-DD)" value={d.dbsIssued} onChangeText={set("dbsIssued")} /></>}
        {step === "pay" && <><Field label="Account holder" value={d.holder} onChangeText={set("holder")} /><Field label="Sort code" value={d.sortCode} onChangeText={set("sortCode")} keyboardType="number-pad" /><Field label="Account number" value={d.account} onChangeText={set("account")} keyboardType="number-pad" maxLength={8} /></>}
        {step === "availability" && <Field label="When can you work?" value={d.availability} onChangeText={set("availability")} placeholder="e.g. Mon–Fri 08:00–17:00" />}
        {step === "contract" && <><P>Read your contract, the health and safety policy and the photo policy in your welcome email.</P><Field label="Type your full name to sign" value={d.signature} onChangeText={set("signature")} /></>}
        {step === "done" && <P>We’ll send your details to {s.businessName}. You can’t receive jobs until they’ve checked your ID, right to work, DBS and bank details.</P>}
        <ErrorText>{err}</ErrorText>
      </ScrollView>
      <View style={{ gap: 10 }}>
        <Button title={step === "done" ? `Send to ${s.businessName ?? "your employer"}` : "Continue"} onPress={next} />
        {i > 0 && <Button kind="light" title="Back" onPress={() => setI(i - 1)} />}
      </View>
    </Screen>
  );
}
