"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RESULTS_RETURN_STORAGE_KEY } from "@/lib/resultsReturnState";

type BackToResultsLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

/**
 * Prefer the browser back stack when we know the visitor came from results,
 * so the list they left is still in memory. Fall back to a normal results URL
 * (which restores scroll via sessionStorage).
 */
export function BackToResultsLink({
  href,
  label = "Back to results",
  className = "mb-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline",
}: BackToResultsLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        try {
          const hasReturnState = Boolean(sessionStorage.getItem(RESULTS_RETURN_STORAGE_KEY));
          if (hasReturnState && window.history.length > 1) {
            event.preventDefault();
            router.back();
          }
        } catch {
          // Follow the href if storage / history isn't available.
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
