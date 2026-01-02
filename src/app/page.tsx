'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { applicationsAtom } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import AtlDashboard from '@/components/roles/atl-dashboard';
import BackOfficeDashboard from '@/components/roles/back-office-dashboard';
import SupervisorDashboard from '@/components/roles/supervisor-dashboard';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { users, User } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [applications, setApplications] = useAtom(applicationsAtom);

  const handleLogin = (user: User) => {
    setLoggedInUser(user);
    setSelectedUser(null); // Close the dialog
  };

  const handleUserCardClick = (user: User) => {
    setSelectedUser(user);
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
       <header className="mb-8 flex items-center gap-4">
        <Logo className="h-12 w-12" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">InnBucks Agent Onboarding</h1>
      </header>
      <div className="text-center max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-primary">Select a Profile to Continue</h2>
        <p className="text-muted-foreground mb-6">Simulate the login for different users in the system.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {users.map(user => (
                <Card key={user.id} onClick={() => handleUserCardClick(user)} className="p-6 text-card-foreground shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 hover:border-primary cursor-pointer">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-muted">
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                    <p className="text-muted-foreground mb-4 flex-grow capitalize">{user.role.replace('-', ' ')}</p>
                    <Button variant="outline" className="w-full">Select Profile</Button>
                </Card>
            ))}
        </div>
      </div>
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Login Confirmation</DialogTitle>
                    <DialogDescription>
                        Please confirm you want to log in as this user.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Avatar>
                        <AvatarFallback>{selectedUser.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{selectedUser.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{selectedUser.role.replace('-', ' ')}</p>
                    </div>
                </div>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-dummy" className="text-right">
                            Password
                        </Label>
                        <Input id="password-dummy" type="password" value="fakepassword" disabled className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                    <Button type="submit" onClick={() => handleLogin(selectedUser)}>Login</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
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
