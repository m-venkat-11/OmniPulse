import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
