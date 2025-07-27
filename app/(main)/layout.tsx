import { AppLayout } from "@/components/layouts/app-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout showRightSidebar={true}>
      {children}
    </AppLayout>
  );
} 