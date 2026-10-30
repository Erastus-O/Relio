import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { useTheme } from "./theme";

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ flex: 1, backgroundColor: t.bg, padding: 16, gap: 14 }, style]}>{children}</View>;
}

export function H1({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontSize: 26, fontWeight: "700", color: t.ink, letterSpacing: -0.5 }}>{children}</Text>;
}

export function P({ children, muted, small, style }: { children: React.ReactNode; muted?: boolean; small?: boolean; style?: object }) {
  const t = useTheme();
  return <Text style={[{ color: muted ? t.ink2 : t.ink, fontSize: small ? 13 : 15, lineHeight: small ? 18 : 21 }, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.card, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line, padding: 14, gap: 10 }, style]}>{children}</View>;
}

export function Button({ title, onPress, kind = "dark", disabled, busy }: { title: string; onPress: () => void; kind?: "dark" | "light" | "brand"; disabled?: boolean; busy?: boolean }) {
  const t = useTheme();
  const bg = kind === "dark" ? t.dark : kind === "brand" ? t.brand : t.card;
  const fg = kind === "dark" ? t.onDark : kind === "brand" ? "#fff" : t.ink;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || busy}
      style={({ pressed }) => ({ backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1, minHeight: 48, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, borderWidth: kind === "light" ? 1 : 0, borderColor: t.line })}>
      {busy ? <ActivityIndicator color={fg} /> : <Text style={{ color: fg, fontWeight: "600", fontSize: 15 }}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.ink2, fontSize: 13, fontWeight: "500" }}>{label}</Text>
      <TextInput placeholderTextColor={t.ink3} {...props} style={{ borderWidth: 1, borderColor: t.line, borderRadius: 12, padding: 12, fontSize: 16, color: t.ink, backgroundColor: t.card }} />
    </View>
  );
}

export function Pill({ label, tone }: { label: string; tone?: "good" | "warn" | "bad" | "info" }) {
  const t = useTheme();
  const map = { good: [t.good, t.goodSoft], warn: [t.warn, t.warnSoft], bad: [t.bad, t.badSoft], info: [t.ink2, t.bg] } as const;
  const [fg, bg] = map[tone ?? "info"];
  return <Text style={{ color: fg, backgroundColor: bg, fontSize: 12, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: "hidden", alignSelf: "flex-start" }}>{label}</Text>;
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return children ? <Text accessibilityRole="alert" style={{ color: t.bad, fontSize: 13 }}>{children}</Text> : null;
}

export const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;
