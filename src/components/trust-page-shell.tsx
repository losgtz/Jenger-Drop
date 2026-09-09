import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function TrustPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
