import IndexStrip from "@/components/IndexStrip";
import { TOTAL_QUESTIONS, questions } from "@/content/questions";

export default function Home() {
  return (
    <main className="home">
      <header className="home__head">
        <span className="mono-k">DS Lab · C++</span>
        <h1>
          Data structures,
          <br />
          <em>one scroll</em> at a time.
        </h1>
        <p>
          Each question opens with the problem. Press Next and the answer runs one move at a time: the code on one side,
          memory on the other, moving together. Press Previous and it rewinds.
        </p>
      </header>
      <IndexStrip total={TOTAL_QUESTIONS} questions={questions} />
    </main>
  );
}
