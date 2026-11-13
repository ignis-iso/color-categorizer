import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";
import { t } from "./i18n.ts";

createRoot(document.getElementById("root")!).render(<App />);

// Título da aba: troca aleatoriamente entre algumas cores.
let last = "";
const rotateTitle = () => {
  const options = t().titleColors.filter((n) => n !== last);
  last = options[Math.floor(Math.random() * options.length)];
  document.title = t().titleTpl(last);
};
rotateTitle();
setInterval(rotateTitle, 3000);
