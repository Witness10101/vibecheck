
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { QuizCreator } from "@/components/quiz/QuizCreator";

type CreatePageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CreatePage({
  searchParams,
}: CreatePageProps) {
  const params = await searchParams;

  return (
    <>
     <Navbar />
     <QuizCreator initialCategory={params.category ?? "friendship"} />
     <Footer />
    </>
  );
}
