import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/lib/session";

function Gate() {
  const s = useSession();
  const seg = useSegments() as string[];
  const router = useRouter();
  useEffect(() => {
    if (!s.ready) return;
    const inAuth = seg[0] === "(auth)";
    if (!s.signedIn && !inAuth) router.replace("/(auth)/welcome");
    else if (s.signedIn && !s.proId && seg[1] !== "businesses") router.replace("/(auth)/businesses");
    else if (s.signedIn && s.proId && s.needsSetup && seg[0] !== "onboarding") router.replace("/onboarding");
    else if (s.signedIn && s.proId && !s.needsSetup && (inAuth || seg[0] === "onboarding")) router.replace("/(tabs)");
  }, [s.ready, s.signedIn, s.proId, s.needsSetup, seg, router]);
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Root() {
  return (
    <SessionProvider>
      <StatusBar style="auto" />
      <Gate />
    </SessionProvider>
  );
}
