import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "../../components/ProjectDetail";
import { allProjects } from "../../lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.detail.slug }));
}

function getProject(slug: string) {
  return allProjects.find((project) => project.detail.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: `${project.title} | Tat Binh Vu`,
    description: project.detail.overview,
    openGraph: {
      title: `${project.title} | Tat Binh Vu`,
      description: project.detail.overview,
      type: "article",
      images: [{ url: project.image, alt: project.imageAlt ?? project.title }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const index = allProjects.findIndex((project) => project.detail.slug === slug);
  if (index === -1) notFound();

  return (
    <ProjectDetail
      project={allProjects[index]}
      previous={allProjects[index - 1]}
      next={allProjects[index + 1]}
    />
  );
}
