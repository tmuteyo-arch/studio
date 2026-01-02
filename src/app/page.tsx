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
import { users, User, Role } from '@/lib/users';
import { Building, UserCheck, UserCog } from 'lucide-react';

export default function Home() {
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
  const [applications, setApplications] = useAtom(applicationsAtom);

  const handleLogin = (role: Role) => {
    // Find the first user with the selected role and log them in.
    const userToLogin = users.find(u => u.role === role);
    if (userToLogin) {
      setLoggedInUser(userToLogin);
    }
  };

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    switch (loggedInUser.role) {
      case 'atl':
        return <AtlDashboard applications={applications} setApplications={setApplications} user={loggedInUser} />;
      case 'back-office':
        return <BackOfficeDashboard applications={applications} setApplications={setApplications} user={loggedInUser} />;
      case 'supervisor':
        return <SupervisorDashboard applications={applications} setApplications={setApplications} user={loggedInUser} />;
      default:
        return null;
    }
  };
  
  const roleInfo: { role: Role; title: string; description: string; icon: React.ReactNode, buttonClass: string, hoverBorder: string }[] = [
      {
        role: 'atl',
        title: 'Agent Team Lead',
        description: 'Submit new customer applications and track their status.',
        icon: <UserCog className="w-12 h-12 text-primary" />,
        buttonClass: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        hoverBorder: 'hover:border-primary',
      },
      {
        role: 'back-office',
        title: 'Back Office',
        description: 'Review and validate documents for submitted applications.',
        icon: <Building className="w-12 h-12 text-secondary" />,
        buttonClass: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
        hoverBorder: 'hover:border-secondary',
      },
      {
        role: 'supervisor',
        title: 'Supervisor',
        description: 'Perform final approval or rejection of applications.',
        icon: <UserCheck className="w-12 h-12 text-accent" />,
        buttonClass: 'border-accent text-accent hover:bg-accent hover:text-accent-foreground',
        hoverBorder: 'hover:border-accent',
      }
  ];

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
           {roleInfo.map(info => {
            return (
                <Card key={info.role} className={`p-6 text-card-foreground shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 ${info.hoverBorder}`}>
                    <div className="mb-4">{info.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{info.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-grow">{info.description}</p>
                    <Button onClick={() => handleLogin(info.role)} className={`w-full ${info.buttonClass}`} variant={info.role === 'supervisor' ? 'outline' : 'default'}>Login as {info.title}</Button>
                </Card>
            );
           })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background">
      {loggedInUser ? (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8" />
                    <h1 className="text-2xl font-bold text-foreground">InnBucks Agent Onboarding</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{loggedInUser.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{loggedInUser.role.replace('-', ' ')}</p>
                    </div>
                    <Button variant="outline" onClick={() => setLoggedInUser(null)}>Log Out</Button>
                </div>
            </header>
            <main>{renderDashboard()}</main>
        </div>
      ) : (
        renderRoleSelection()
      )}
    </div>
  );
}
