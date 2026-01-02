'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { applicationsAtom } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { users, User } from '@/lib/users';

export default function Home() {
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
  const [applications, setApplications] = useAtom(applicationsAtom);

  const handleLogin = (role: User['role']) => {
    // Find the first user with the selected role and log them in
    const userToLogin = users.find(user => user.role === role);
    if (userToLogin) {
      setLoggedInUser(userToLogin);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  }

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
  
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <header className="mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Logo className="h-12 w-12" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">InnBucks Agent Onboarding</h1>
        </div>
        <h2 className="text-2xl font-semibold text-primary">Select a Role to Continue</h2>
        <p className="text-muted-foreground mt-2">Simulate the login for different user roles in the system.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card className="bg-card text-card-foreground flex flex-col">
          <CardHeader>
            <CardTitle className="text-center">ATL</CardTitle>
          </CardHeader>
          <CardContent className="text-center flex-grow">
            <CardDescription>Account Taking Leaders who submit applications.</CardDescription>
          </CardContent>
          <div className="p-6 pt-0">
             <Button className="w-full" onClick={() => handleLogin('atl')}>Login as ATL</Button>
          </div>
        </Card>
        
        <Card className="bg-card text-card-foreground flex flex-col">
          <CardHeader>
            <CardTitle className="text-center">Back Office</CardTitle>
          </CardHeader>
          <CardContent className="text-center flex-grow">
            <CardDescription>Officers who validate and process applications.</CardDescription>
          </CardContent>
          <div className="p-6 pt-0">
            <Button variant="secondary" className="w-full" onClick={() => handleLogin('back-office')}>Login as Back Office</Button>
          </div>
        </Card>

        <Card className="bg-card text-card-foreground flex flex-col">
          <CardHeader>
            <CardTitle className="text-center">Supervisor</CardTitle>
          </CardHeader>
          <CardContent className="text-center flex-grow">
            <CardDescription>Supervisors who review, approve, or reject applications.</CardDescription>
          </CardContent>
          <div className="p-6 pt-0">
            <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent" onClick={() => handleLogin('supervisor')}>Login as Supervisor</Button>
          </div>
        </Card>
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
                    <Button variant="outline" onClick={handleLogout}>Log Out</Button>
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
