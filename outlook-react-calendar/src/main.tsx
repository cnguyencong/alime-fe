import { Providers } from "@microsoft/mgt-element";
import { Msal2Provider } from "@microsoft/mgt-msal2-provider";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID as string;
const authority = import.meta.env.VITE_MSAL_AUTHORITY as string | undefined;
const scopesEnv = "openid,profile,offline_access,User.Read,Calendars.ReadWrite";
const scopes = scopesEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
  const clientSecret = import.meta.env.VITE_MSAL_CLIENT_SECRET as string;

Providers.globalProvider = new Msal2Provider({
  clientId,
  authority,
  
  scopes,
});

createRoot(document.getElementById("root")!).render(<App />);
