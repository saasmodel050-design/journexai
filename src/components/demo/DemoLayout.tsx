import { ReactNode, useState } from 'react';
import DemoSidebar from './DemoSidebar';
import DemoTopbar from './DemoTopbar';
import DemoBanner from './DemoBanner';
import FloatingCTA from './FloatingCTA';
import SignupModal from './SignupModal';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DemoLayoutProps {
  children: ReactNode | ((ctx: { openModal: (msg?: string) => void }) => ReactNode);
}

const DemoLayout = ({ children }: DemoLayoutProps) => {
  const [modal, setModal] = useState<{ open: boolean; message?: string }>({ open: false });
  const openModal = (msg?: string) => setModal({ open: true, message: msg });

  const renderedChildren = typeof children === 'function' ? children({ openModal }) : children;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DemoSidebar openModal={openModal} />
        <div className="flex-1 flex flex-col min-h-screen">
          <DemoTopbar />
          <DemoBanner />
          <main className="flex-1 p-6 overflow-auto">
            {renderedChildren}
          </main>
          <FloatingCTA />
        </div>
      </div>
      <SignupModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        message={modal.message}
      />
    </SidebarProvider>
  );
};

export default DemoLayout;
