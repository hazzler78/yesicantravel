"use client";

import { EmailSignupBox } from "@/components/EmailSignupBox";

/** Full-width homepage newsletter band. */
export default function NewsletterForm() {
  return <EmailSignupBox variant="section" pagePath="/" placement="home" />;
}
