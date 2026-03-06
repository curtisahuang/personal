import { redirect } from "next/navigation";

type GameProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const GameProjectPage = async ({ params }: GameProjectPageProps) => {
  const { slug } = await params;
  redirect(`/games-and-toys/projects/${slug}/index.html`);
};

export default GameProjectPage;
