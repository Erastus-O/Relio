import { useColorScheme } from "react-native";

const light = { bg: "#f7f7f6", card: "#ffffff", ink: "#141414", ink2: "#5c5c5c", ink3: "#9e9e9e", line: "#e2e2e1", brand: "#f05d23", brandSoft: "#fff3ed", good: "#15803d", goodSoft: "#eaf7ef", warn: "#b45309", warnSoft: "#fff7e6", bad: "#dc2626", badSoft: "#fef2f2", dark: "#141414", onDark: "#ffffff" };
const dark: typeof light = { bg: "#0b0b0b", card: "#1b1b1b", ink: "#f2f2f2", ink2: "#a3a3a3", ink3: "#6b6b6b", line: "#2a2a2a", brand: "#f96b34", brandSoft: "#3a1a0d", good: "#4cc48e", goodSoft: "#0f2a1d", warn: "#f5b04c", warnSoft: "#33240b", bad: "#f87171", badSoft: "#3a1212", dark: "#f2f2f2", onDark: "#0b0b0b" };

export type Theme = typeof light;
export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
