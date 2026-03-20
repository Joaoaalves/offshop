import AppSideBar from "@/components/app-sidebar";
import { HeaderUser } from "@/components/header-user";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <div className="flex flex-1 flex-col max-w-screen overflow-hidden">
        <header className="bg-card sticky top-0 z-50 flex h-13.75 items-center justify-between gap-6 border-b px-4 py-2 sm:px-6">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <HeaderUser />
        </header>
        <main className="size-full flex-1 px-4 py-6 sm:px-6 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
