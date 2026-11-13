import { COLORS } from "./colors.ts";

interface Props {
  onStart: () => void;
  onResume?: () => void;
  resumeCount: number;
}

export default function Intro({ onStart, onResume, resumeCount }: Props) {
  return (
    <section className="card intro">
      <h1>Seu vermelho é o meu vermelho?</h1>
      <p className="lead">
        Faça esse teste desnecessariamente longo e descubra o seu gráfico de
        categorização de cor. São {COLORS.length} cores, o que pode demorar um
        pouco.
      </p>

      <h2>Como funciona</h2>
      <ol>
        <li>
          Uma cor por vez aparece na tela, em um fundo cinza neutro, em ordem
          aleatória.
        </li>
        <li>
          Dê a ela <strong>o nome que quiser</strong>: “verde”, “roxo”,
          “salmão”… não existe resposta certa.
        </li>
        <li>No final, mostramos a grade de cores dividida pelas suas categorias.</li>
      </ol>

      <h2>Antes de começar</h2>
      <ul className="tips">
        <li>
          <strong>Use poucos nomes.</strong> Tente ficar com algo entre 6 e 12
          categorias no total. Se der um nome diferente para cada tom, a grade
          final perde o sentido.
        </li>
        <li>
          <strong>Prefira nomes de cor “básicos”</strong> (azul, verde,
          amarelo…) em vez de tons muito específicos (azul-petróleo-claro).
        </li>
        <li>
          Nomes que você já usou aparecem como botões — reaproveite-os sempre
          que a cor ainda couber neles.
        </li>
        <li>
          Só crie um nome novo quando a cor realmente não combinar com nenhum
          dos anteriores.
        </li>
        <li>Não pense demais: vale a primeira impressão.</li>
      </ul>

      <div className="actions">
        <button className="primary" onClick={onStart}>
          Começar
        </button>
        {onResume && (
          <button onClick={onResume}>
            Continuar de onde parei ({resumeCount}/{COLORS.length})
          </button>
        )}
      </div>
    </section>
  );
}
