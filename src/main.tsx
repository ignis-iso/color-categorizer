import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);

// Título da aba: troca aleatoriamente entre algumas cores.
const NAMES = ["vermelho", "azul", "verde", "amarelo"];
let last = "";
const rotateTitle = () => {
  const options = NAMES.filter((n) => n !== last);
  last = options[Math.floor(Math.random() * options.length)];
  document.title = `Seu ${last} é o meu ${last}?`;
};
rotateTitle();
setInterval(rotateTitle, 3000);
