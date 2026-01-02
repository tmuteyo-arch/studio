'use client';

import * as React from 'react';
import { Application } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, FileText, History, BarChart2, User, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface ApplicationReviewProps {
  application: Application;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  onBack: () => void;
  showActions?: boolean;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
);

export default function ApplicationReview({ application, setApplications, onBack, showActions = false }: ApplicationReviewProps) {

  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            {showActions && (
                 <div className="space-x-2">
                    <Button variant="destructive"><X className="mr-2 h-4 w-4" />Reject</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><Check className="mr-2 h-4 w-4" />Approve</Button>
                </div>
            )}
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Review Application: {application.id}</CardTitle>
          <CardDescription>
            Reviewing application for <strong>{application.clientName}</strong> submitted on {application.submittedDate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details"><User className="mr-2 h-4 w-4"/>Customer Details</TabsTrigger>
                    <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                    <TabsTrigger value="chart"><BarChart2 className="mr-2 h-4 w-4"/>Chart</TabsTrigger>
                    <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Activity Log</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Applicant Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <DetailItem label="Client Name" value={application.clientName} />
                             <DetailItem label="Client Type" value={application.clientType} />
                             <DetailItem label="Submission Date" value={application.submittedDate} />
                             <DetailItem label="Submitted By" value={application.submittedBy} />
                             <DetailItem label="Status" value={application.status} />
                             <DetailItem label="Last Updated" value={application.lastUpdated} />
                           </div>
                           <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <DetailItem label="Address" value={application.details.address} />
                               <DetailItem label="Date of Birth" value={application.details.dateOfBirth} />
                               <DetailItem label="Contact Number" value={application.details.contactNumber} />
                               <DetailItem label="Email" value={application.details.email} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {application.documents.map(doc => (
                                    <li key={doc.type} className="flex items-center justify-between p-3 rounded-md border">
                                        <div>
                                            <p className="font-medium">{doc.type}</p>
                                            <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                                        </div>
                                        <Button variant="outline" size="sm">View Document</Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="chart" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Chart</CardTitle>
                            <CardDescription>Visual representation of application data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-md">
                                <p className="text-muted-foreground">Chart placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                   <Card>
                        <CardHeader>
                            <CardTitle>Application History</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-4">
                                {application.history.map((entry, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                                                {entry.action === 'Submitted' ? <FileText className="h-5 w-5"/> : <User className="h-5 w-5"/>}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium">{entry.action} by {entry.user}</p>
                                            <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                                            {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
