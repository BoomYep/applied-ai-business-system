import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Home() {
  return (
    <div className="flex flex-col w-full space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">
            Applied AI Business System
          </h1>
          <p className="text-lg text-text-secondary">
            Turn customer requests into structured business actions.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Priority Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="Low" />
            <Badge variant="Normal" />
            <Badge variant="High" />
            <Badge variant="Urgent" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Status Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="New" />
            <Badge variant="In Review" />
            <Badge variant="In Progress" />
            <Badge variant="Completed" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Form Fields
          </h2>
          <div className="space-y-4 max-w-md">
            <Field
              label="Email"
              type="input"
              inputProps={{
                type: "email",
                placeholder: "Enter your email",
              }}
            />
            <Field
              label="Description"
              type="textarea"
              textareaProps={{
                placeholder: "Enter description",
              }}
            />
            <Field
              label="With Error"
              type="input"
              error="This field is required"
              inputProps={{
                placeholder: "Invalid input",
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Empty State
          </h2>
          <div className="border border-surface-border rounded-[var(--radius-lg)] bg-surface">
            <EmptyState
              title="No requests yet"
              description="When you submit a customer request, it will appear here."
            />
          </div>
        </section>
    </div>
  );
}
