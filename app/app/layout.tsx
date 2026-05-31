import { AppShell } from "@/components/app-shell";
import { AppStateProvider } from "@/lib/state/app-state";

export default function AttendeeLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppStateProvider>
      <AppShell>{children}</AppShell>
    </AppStateProvider>
  );
}
