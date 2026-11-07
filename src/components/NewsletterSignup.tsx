import { useState, type FormEvent } from "react";

// Email signup for the KAYANU list. Posts to /api/newsletter (Resend); the
// backend sends a welcome email and notifies the owner, who collects the
// addresses until a list provider is wired up.
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="card-soft p-6 font-semibold text-foreground">
        You&apos;re in — welcome to KAYANU! Watch your inbox for a welcome email.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className="w-full flex-1 rounded-2xl border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary whitespace-nowrap">
        {status === "loading" ? "Joining…" : "Join the list"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-600 sm:w-full">
          {message}
        </p>
      )}
    </form>
  );
}
