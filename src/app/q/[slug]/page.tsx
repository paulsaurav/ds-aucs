import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestion, pad, questions } from "@/content/questions";
import { lessons } from "@/lessons";

export const dynamicParams = false;

export function generateStaticParams() {
  return questions.filter((q) => lessons[q.slug]).map((q) => ({ slug: q.slug }));
}

export async function generateMetadata(props: PageProps<"/q/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const q = getQuestion(slug);
  return q ? { title: `Q${pad(q.n)} · ${q.topic} — DS Lab`, description: q.prompt } : {};
}

export default async function QuestionPage(props: PageProps<"/q/[slug]">) {
  const { slug } = await props.params;
  const q = getQuestion(slug);
  const Lesson = lessons[slug];
  if (!q || !Lesson) notFound();
  return <Lesson q={q} />;
}
