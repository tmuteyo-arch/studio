'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';

type Role = 'atl' | 'back-office' | 'supervisor' | null;

export default function Home() {
  const [selectedRole, setSelectedRole] = React.useState<Role>(null);

  const renderDashboard = () => {
    switch (selectedRole) {
      case 'atl':
        return <AtlDashboard />;
      case 'back-office':
        return <BackOfficeDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      default:
        return null;
    }
  };

  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
       <header className="mb-8 flex items-center gap-3">
        <Logo className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">SwiftAccount</h1>
      </header>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Select a Role to Continue</h2>
        <p className="text-muted-foreground mb-6">Simulate the login for different user roles in the system.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2">ATL</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Account Taking Leaders who submit applications.</p>
                <Button onClick={() => setSelectedRole('atl')} className="w-full">Login as ATL</Button>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2">Back Office</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Officers who validate and process applications.</p>
                <Button onClick={() => setSelectedRole('back-office')} className="w-full">Login as Back Office</Button>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2">Supervisor</h3>
                <p className="text-muted-foreground mb-4 flex-grow">Supervisors who review, approve, or reject applications.</p>
                <Button onClick={() => setSelectedRole('supervisor')} className="w-full">Login as Supervisor</Button>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {selectedRole ? (
        <div className="p-4 sm:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">SwiftAccount</h1>
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
