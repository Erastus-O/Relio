import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Button, ErrorText, Field, H1, P, Screen } from "@/lib/ui";

export default function Login() {
  const s = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setErr(""); setBusy(true);
    try {
      const r = await api<{ devCode?: string }>("/auth/code", { json: { email } });
      setInfo(`We’ve emailed a 6-digit code to ${email}.${r.devCode ? ` Development code: ${r.devCode}` : ""}`);
      setStep(2);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function verify() {
    setErr(""); setBusy(true);
    try {
      const r = await api<{ token: string }>("/auth/verify", { json: { email, code } });
      await s.signIn(r.token, email);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen style={{ paddingTop: 72 }}>
        <H1>{step === 1 ? "Sign in" : "Check your email"}</H1>
        <P muted>{step === 1 ? "We’ll email you a 6-digit code. Use the email your employer has for you." : info}</P>
        {step === 1
          ? <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          : <Field label="6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" />}
        <ErrorText>{err}</ErrorText>
        <Button title={step === 1 ? "Email me a code" : "Verify"} onPress={step === 1 ? send : verify} busy={busy} />
        {step === 2 && <Button kind="light" title="Use a different email" onPress={() => setStep(1)} />}
      </Screen>
    </KeyboardAvoidingView>
  );
}
