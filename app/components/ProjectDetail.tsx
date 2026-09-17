import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { ArchiveItem, Project } from "../lib/content";
import Cursor from "./Cursor";

type PortfolioProject = Project | ArchiveItem;

export default function ProjectDetail({
  project,
  previous,
  next,
}: {
  project: PortfolioProject;
  previous?: PortfolioProject;
  next?: PortfolioProject;
}) {
  const { detail } = project;
  const description = "description" in project ? project.description : detail.overview;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Cursor />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_75%_8%,color-mix(in_oklch,var(--accent)_18%,transparent),transparent_38%),linear-gradient(180deg,color-mix(in_oklch,var(--foreground)_3%,transparent),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-8 md:pb-32 md:pt-12 lg:px-20">
        <nav className="flex items-center justify-between border-b border-border/50 pb-5">
          <Link
            href="/#work"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-mono uppercase tracking-wide text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to works
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Case study
          </span>
        </nav>

        <section className="grid gap-12 pb-20 pt-16 md:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] md:items-end md:gap-16 md:pb-28 md:pt-24">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {project.year} · {project.tagline}
            </p>
            <h1 className="max-w-4xl text-[clamp(2.8rem,8vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.07em] text-balance">
              {project.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {detail.overview}
            </p>
            <p className="mt-5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Role: <span className="text-foreground">{detail.role}</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={project.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Visit live site
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/#work"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                All works
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.8)] md:aspect-[5/4] md:rounded-3xl">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,color-mix(in_oklch,var(--accent)_28%,transparent),transparent_58%)]"
              aria-hidden="true"
            />
            <Image
              src={project.image}
              alt={project.imageAlt ?? `${project.title} preview`}
              fill
              priority
              className="object-contain object-center p-5 transition-transform duration-700 hover:scale-[1.03] md:p-8"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>

        <section className="grid gap-12 border-t border-border/50 py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">01 / Overview</p>
            <h2 className="mt-4 max-w-md text-3xl font-black uppercase tracking-tight md:text-5xl">
              Built for useful outcomes.
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {description}
            </p>
            <p className="mt-8 border-l-2 border-accent pl-5 text-base leading-relaxed text-foreground/80">
              {detail.outcome}
            </p>
          </div>
        </section>

        <section className="grid gap-12 border-t border-border/50 py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">02 / Responsibilities</p>
            <h2 className="mt-4 max-w-md text-3xl font-black uppercase tracking-tight md:text-5xl">
              What I worked on.
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {detail.responsibilities.map((responsibility) => (
              <li
                key={responsibility}
                className="flex gap-3 rounded-xl border border-border/50 bg-foreground/3 p-5 text-base leading-relaxed text-muted-foreground"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                {responsibility}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-12 border-t border-border/50 py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">03 / Modules & Domain</p>
            <h2 className="mt-4 max-w-md text-3xl font-black uppercase tracking-tight md:text-5xl">
              Product context.
            </h2>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            {detail.domain.map((domain) => (
              <span
                key={domain}
                className="rounded-md border border-border/60 bg-foreground/3 px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground"
              >
                {domain}
              </span>
            ))}
          </div>
        </section>

        <section className="border-t border-border/50 py-16 md:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">04 / Stack</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {detail.technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-md border border-accent/30 bg-accent/8 px-3 py-2 font-mono text-xs uppercase tracking-wide text-foreground"
              >
                {technology}
              </span>
            ))}
          </div>
        </section>

        <nav className="grid gap-4 border-t border-border/50 pt-8 sm:grid-cols-2" aria-label="Project navigation">
          {previous ? (
            <Link
              href={`/work/${previous.detail.slug}`}
              className="group rounded-xl border border-border/50 p-5 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Previous</span>
              <span className="mt-3 flex items-center justify-between text-xl font-black uppercase tracking-tight">
                {previous.title}
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ) : <span />}
          {next ? (
            <Link
              href={`/work/${next.detail.slug}`}
              className="group rounded-xl border border-border/50 p-5 text-right transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Next</span>
              <span className="mt-3 flex items-center justify-between gap-4 text-xl font-black uppercase tracking-tight">
                <span className="ml-auto">{next.title}</span>
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
              </span>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}
