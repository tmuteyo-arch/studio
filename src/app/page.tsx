import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-background p-4 sm:p-8">
      <header className="mb-8 flex items-center gap-3 self-start sm:self-center">
        <Logo className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">SwiftAccount</h1>
      </header>
      <main className="w-full max-w-6xl flex-1">
        <OnboardingFlow />
      </main>
    </div>
  );
}
