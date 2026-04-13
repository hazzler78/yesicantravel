import LeadMagnetForm from "@/components/LeadMagnetForm";

export const metadata = {
  title: "Solo Female Safety Checklist",
  description: "Free checklist to help women plan safer solo stays with confidence.",
};

export default function LeadMagnetPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-[var(--navy)]">
      <h1 className="text-3xl font-bold">Free Solo Female Safety Checklist</h1>
      <p className="mt-3 text-[var(--navy-light)]">
        Get the practical PDF we use to help solo women travelers evaluate destinations, hotels, and arrival safety.
      </p>
      <div className="mt-6 rounded-xl border border-[var(--sand)] bg-[var(--sand)]/30 p-5">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Pre-arrival safety prep in 10 minutes</li>
          <li>Hotel safety feature checklist</li>
          <li>Night arrival and transport safeguards</li>
        </ul>
      </div>
      <LeadMagnetForm />
    </main>
  );
}
