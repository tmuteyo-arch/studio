'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const rates = [
    { from: 'USD', to: 'ZWL', rate: '3,619.00' },
    { from: 'EUR', to: 'USD', rate: '1.09' },
    { from: 'GBP', to: 'USD', rate: '1.27' },
    { from: 'ZAR', to: 'USD', rate: '0.053' },
];

export default function ExchangeRates() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Exchange Rates
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {rates.map(rate => (
                            <TableRow key={`${rate.from}-${rate.to}`}>
                                <TableCell className="font-medium">{rate.from}</TableCell>
                                <TableCell className="text-muted-foreground"><ArrowRight className="h-4 w-4" /></TableCell>
                                <TableCell className="font-medium">{rate.to}</TableCell>
                                <TableCell className="text-right font-semibold">{rate.rate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
