import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { loadToken, saveToken } from "./api";

interface Session {
  ready: boolean;
  signedIn: boolean;
  email: string | null;
  proId: string | null;
  businessName: string | null;
  needsSetup: boolean;
  finishSetup(): void;
  signIn(token: string, email: string): Promise<void>;
  choose(proId: string, businessName: string, setupDone?: boolean): Promise<void>;
  switchBusiness(): Promise<void>;
  signOut(): Promise<void>;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [proId, setProId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      setSignedIn(Boolean(t));
      setEmail(await SecureStore.getItemAsync("relio-email"));
      setProId(await SecureStore.getItemAsync("relio-pro"));
      setBusinessName(await SecureStore.getItemAsync("relio-business-name"));
      setReady(true);
    })();
  }, []);

  const value: Session = {
    ready, signedIn, email, proId, businessName, needsSetup,
    finishSetup() { setNeedsSetup(false); },
    async signIn(token, e) {
      await saveToken(token);
      await SecureStore.setItemAsync("relio-email", e);
      setEmail(e);
      setSignedIn(true);
    },
    async choose(id, name, setupDone = true) {
      setNeedsSetup(!setupDone);
      await SecureStore.setItemAsync("relio-pro", id);
      await SecureStore.setItemAsync("relio-business-name", name);
      setProId(id);
      setBusinessName(name);
    },
    async switchBusiness() {
      await SecureStore.deleteItemAsync("relio-pro");
      setProId(null);
    },
    async signOut() {
      await saveToken(null);
      await SecureStore.deleteItemAsync("relio-pro");
      setSignedIn(false);
      setProId(null);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
