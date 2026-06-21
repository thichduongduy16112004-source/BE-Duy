
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { initializeSupabaseContentProvider } from "./app/content/supabaseContentProvider.ts";
  import "./styles/index.css";

  initializeSupabaseContentProvider().finally(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
  
