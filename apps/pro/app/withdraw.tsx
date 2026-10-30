import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, Field, H1, P, Screen, gbp } from "@/lib/ui";

interface Account { id: string; holder: string; bankName: string; sortCode: string; last4: string; preferred: boolean }
interface Wallet { balance: number; accounts: Account[] }

export default function Withdraw() {
  const s = useSession();
  const t = useTheme();
  const [w, setW] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [acc, setAcc] = useState({ holder: "", sortCode: "", accountNumber: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const load = () => api<Wallet>(`/pro/${s.proId}/wallet`).then((x) => { setW(x); setAmount((x.balance / 100).toFixed(2)); setTo((cur) => cur ?? x.accounts.find((a) => a.preferred)?.id ?? x.accounts[0]?.id ?? null); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load().catch((e) => setErr(e.message)); }, []);

  async function addAccount() {
    setErr("");
    try { const a = await api<{ id: string }>(`/pro/${s.proId}/payout-accounts`, { json: { ...acc, preferred: true } }); setTo(a.id); setAdding(false); load(); } catch (e) { setErr((e as Error).message); }
  }
  async function go() {
    setErr("");
    const pence = Math.round(parseFloat(amount.replace(/[£,\s]/g, "")) * 100);
    if (!(pence >= 100)) return setErr("The smallest withdrawal is £1.00.");
    if (w && pence > w.balance) return setErr(`You can withdraw up to ${gbp(w.balance)}.`);
    if (!to) return setErr("Choose an account.");
    try { const r = await api<{ ref: string }>(`/pro/${s.proId}/withdrawals`, { json: { amount: pence, accountId: to } }); setDone(r.ref); } catch (e) { setErr((e as Error).message); }
  }

  if (done) return (
    <Screen style={{ paddingTop: 96, alignItems: "center" }}>
      <H1>Withdrawal on its way</H1>
      <P muted style={{ textAlign: "center" }}>It usually arrives within 2 hours, and always by the end of the next working day. Ref {done}.</P>
      <Button title="Back to Home" onPress={() => router.back()} />
    </Screen>
  );
  return (
    <Screen style={{ paddingTop: 56 }}>
      <Button kind="light" title="← Home" onPress={() => router.back()} />
      <H1>Withdraw</H1>
      <Card><P muted small>Available</P><Text style={{ color: t.ink, fontSize: 22, fontWeight: "700" }}>{w ? gbp(w.balance) : "…"}</Text></Card>
      <Field label="Amount (£)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <P muted small>TO</P>
      {w?.accounts.map((a) => (
        <Pressable key={a.id} accessibilityRole="radio" accessibilityState={{ checked: to === a.id }} onPress={() => setTo(a.id)}>
          <Card style={to === a.id ? { borderColor: t.brand, borderWidth: 2 } : undefined}>
            <Text style={{ color: t.ink, fontWeight: "600" }}>{a.bankName} ••••{a.last4}</Text>
            <P muted small>{a.holder} · {a.sortCode}{a.preferred ? " · Preferred" : ""}</P>
          </Card>
        </Pressable>
      ))}
      {adding ? (
        <Card>
          <Field label="Account holder" value={acc.holder} onChangeText={(v) => setAcc({ ...acc, holder: v })} />
          <Field label="Sort code" value={acc.sortCode} onChangeText={(v) => setAcc({ ...acc, sortCode: v })} keyboardType="number-pad" />
          <Field label="Account number" value={acc.accountNumber} onChangeText={(v) => setAcc({ ...acc, accountNumber: v })} keyboardType="number-pad" maxLength={8} />
          <View style={{ flexDirection: "row", gap: 8 }}><View style={{ flex: 1 }}><Button kind="light" title="Cancel" onPress={() => setAdding(false)} /></View><View style={{ flex: 1 }}><Button title="Save account" onPress={addAccount} /></View></View>
        </Card>
      ) : <Button kind="light" title="+ Add another account" onPress={() => setAdding(true)} />}
      <ErrorText>{err}</ErrorText>
      <Button kind="brand" title="Withdraw" onPress={go} />
      <P muted small>Free. Your employer pays your wages into this balance on pay day, with tax and National Insurance already taken off.</P>
    </Screen>
  );
}
