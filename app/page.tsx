import { IntakeForm } from "@/components/intake-form/IntakeForm";

export default function Home() {
  return (
    <div className="flex flex-col w-full space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-text-primary">
          Applied AI Business System
        </h1>
        <p className="text-lg text-text-secondary">
          Turn customer requests into structured business actions.
        </p>
      </header>

      <section className="max-w-2xl">
        <IntakeForm />
      </section>

      <footer className="pt-8 border-t border-surface-border">
        <p className="text-sm text-text-secondary leading-relaxed">
          This demo shows how AI can transform unstructured customer requests
          into structured operational workflows.
        </p>
      </footer>
    </div>
  );
}
