'use client';
import * as React from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { applicationsAtom, ApplicationStatus, Application } from '@/lib/mock-data';
import { User } from '@/lib/users';
import { CheckCircle2, AlertCircle, Inbox, BarChart, FileSignature, Edit, FileCheck2 } from 'lucide-react';
import ApplicationReview from '../onboarding/application-review';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';


interface RetailExecutiveDashboardProps {
    user: User;
}

export default function RetailExecutiveDashboard({ user }: RetailExecutiveDashboardProps) {
    const [applications] = useAtom(applicationsAtom);
    const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

    const summaryStats = React.useMemo(() => {
        const pendingStatuses: ApplicationStatus[] = ['Submitted', 'In Review', 'Returned to ATL', 'Pending Supervisor'];
        return {
            totalPending: applications.filter(a => pendingStatuses.includes(a.status)).length,
            totalApproved: applications.filter(a => a.status === 'Approved').length,
            totalRejected: applications.filter(a => a.status === 'Rejected').length,
            totalApplications: applications.length,
            pendingAgreementSignature: applications.filter(a => a.status === 'Approved - Pending Executive Signature').length,
        };
    }, [applications]);

    const agreementsToSign = applications.filter(app => app.status === 'Approved - Pending Executive Signature');
    const signedAgreements = applications.filter(app => app.status === 'Signed');

    const applicationForReview = selectedApplication 
      ? applications.find(app => app.id === selectedApplication.id) 
      : null;

    if (applicationForReview) {
        return <ApplicationReview 
                  application={applicationForReview}
                  onBack={() => setSelectedApplication(null)}
                  user={user}
               />;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-start">
                <div>
                <h2 className="text-3xl font-bold">Retail Executive Dashboard</h2>
                <p className="text-muted-foreground">High-level summary and final verification of agreements.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agreements to Sign</CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.pendingAgreementSignature}</div>
                        <p className="text-xs text-muted-foreground">Agreements needing your signature.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalPending}</div>
                        <p className="text-xs text-muted-foreground">Applications in the pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApproved}</div>
                        <p className="text-xs text-muted-foreground">Successfully onboarded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalRejected}</div>
                        <p className="text-xs text-muted-foreground">Did not proceed</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">All records in the system</p>
                    </CardContent>
                </Card>
            </div>
            
            {agreementsToSign.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Edit />
                            Agreements Pending Your Signature
                        </CardTitle>
                        <CardDescription>
                            These applications have been signed by a supervisor and require your final verification and signature.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Client Type</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agreementsToSign.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>{app.clientType}</TableCell>
                                        <TableCell>{new Date(app.lastUpdated).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>Verify & Sign</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}


            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck2 />
                        Finalized Agency Agreements
                    </CardTitle>
                    <CardDescription>
                        A list of all agency agreements that have been fully signed and finalized.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {signedAgreements.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>App ID</TableHead>
                                    <TableHead>Client Name</TableHead>
                                    <TableHead>Client Type</TableHead>
                                    <TableHead>Date Signed</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {signedAgreements.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                                        <TableCell className="font-medium">{app.clientName}</TableCell>
                                        <TableCell>{app.clientType}</TableCell>
                                        <TableCell>{app.details.executiveSignatureTimestamp ? new Date(app.details.executiveSignatureTimestamp).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                No signed agency agreements yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      )
}
