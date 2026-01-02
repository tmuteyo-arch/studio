'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { applicationsAtom } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import { Card } from '@/components/ui/card';

export type Role = 'atl' | 'back-office' | 'supervisor' | null;

export default function Home() {
  const [selectedRole, setSelectedRole] = React.useState<Role>(null);
  const [applications, setApplications] = useAtom(applicationsAtom);

  const renderDashboard = () => {
    switch (selectedRole) {
      case 'atl':
        return <AtlDashboard applications={applications} setApplications={setApplications} />;
      case 'back-office':
        return <BackOfficeDashboard applications={applications} setApplications={setApplications} />;
      case 'supervisor':
        return <SupervisorDashboard applications={applications} setApplications={setApplications} />;
      default:
        return null;
    }
  };

  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
       <header className="mb-8 flex items-center gap-4">
        <Logo className="h-12 w-12" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">InnBucks Agent Onboarding</h1>
      </header>
      <div className="text-center max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-primary">Select a Role to Continue</h2>
        <p className="text-muted-foreground mb-6">Simulate the login for different user roles in the system.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-card-foreground shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 hover:border-primary">
                <h3 className="text-xl font-bold mb-2">ATL</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Account Taking Leaders who submit applications.</p>
                <Button onClick={() => setSelectedRole('atl')} className="w-full">Login as ATL</Button>
            </Card>
            <Card className="p-6 text-card-foreground shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 hover:border-secondary">
                <h3 className="text-xl font-bold mb-2">Back Office</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Officers who validate and process applications.</p>
                <Button onClick={() => setSelectedRole('back-office')} variant="secondary" className="w-full">Login as Back Office</Button>
            </Card>
            <Card className="p-6 text-card-foreground shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 hover:border-accent">
                <h3 className="text-xl font-bold mb-2">Supervisor</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Supervisors who review, approve, or reject applications.</p>
                <Button onClick={() => setSelectedRole('supervisor')} variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">Login as Supervisor</Button>
            </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background">
      {selectedRole ? (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <h1 className="text-2xl font-bold text-foreground">InnBucks Agent Onboarding</h1>
                </div>
                <Button variant="outline" onClick={() => setSelectedRole(null)}>Log Out</Button>
            </header>
            <main>{renderDashboard()}</main>
        </div>
      ) : (
        renderRoleSelection()
      )}
    </div>
  );
}
