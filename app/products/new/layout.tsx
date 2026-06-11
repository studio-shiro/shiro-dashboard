"use client";

import { WizardTopBar } from "@/components/products/wizard/WizardTopBar";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-background-400 px-5 pb-[30px] pt-3">
      <WizardTopBar />
      {children}
    </div>
  );
}
