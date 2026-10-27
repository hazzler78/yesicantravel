"use client";

import { EmailSignupBox } from "@/components/EmailSignupBox";
import { LeadMagnetInlineCta } from "@/components/home/LeadMagnetInlineCta";
import { preferredEmailCaptureKind } from "@/lib/emailCapture";
import { useEmailCaptureSubscribed } from "@/hooks/useEmailCaptureSubscribed";

type EmailCaptureResultsSlotProps = {
  city?: string | null;
};

/** At most one post-list email capture on /results (city list when place is known). */
export function EmailCaptureResultsSlot({ city }: EmailCaptureResultsSlotProps) {
  const subscribed = useEmailCaptureSubscribed(false);
  if (subscribed) return null;

  const kind = preferredEmailCaptureKind(city);
  if (kind === "city-list") {
    return (
      <EmailSignupBox
        variant="inline"
        city={city}
        placement="results"
        pagePath="/results"
      />
    );
  }

  return <LeadMagnetInlineCta pagePath="/results" />;
}
