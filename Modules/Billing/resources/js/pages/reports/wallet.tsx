import Breadcrumbs from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader as TableHeadRow,
   TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/layouts/dashboard/layout';
import {
   index as walletReports,
   reject,
   verify,
} from '@/routes/wallet-reports';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface WalletTransactionRow {
   id: number;
   type: string;
   amount: string;
   balance_after: string;
   status: string;
   transaction_id: string | null;
   description: string | null;
   meta: { note?: string; admin_notes?: string } | null;
   created_at: string;
   user?: { id: number; name: string; email: string } | null;
}

interface Props extends SharedData {
   transactions: {
      data: WalletTransactionRow[];
      links: { url: string | null; label: string; active: boolean }[];
   };
   filters: { status?: string; search?: string };
   currency: string;
}

const statusVariant = (status: string): string => {
   switch (status) {
      case 'completed':
         return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'rejected':
         return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
         return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
   }
};

const statusFilters = [
   { label: 'All', value: '' },
   { label: 'Pending', value: 'pending' },
   { label: 'Completed', value: 'completed' },
   { label: 'Rejected', value: 'rejected' },
];

const WalletReports = () => {
   const { props } = usePage<Props>();
   const { transactions, filters, currency } = props;

   const handleAction = (id: number, action: 'verify' | 'reject') => {
      const message =
         action === 'verify'
            ? 'Approve this deposit and credit the user wallet?'
            : 'Reject this deposit request?';

      if (!window.confirm(message)) {
         return;
      }

      router.post(action === 'verify' ? verify.url(id) : reject.url(id));
   };

   return (
      <>
         <Breadcrumbs
            title="Wallet Deposits"
            breadcrumbs={[
               { title: 'Dashboard', href: '/dashboard' },
               { title: 'Wallet Deposits' },
            ]}
            className="mb-4"
         />

         <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
               <h3 className="text-lg font-medium">Wallet Deposit Requests</h3>

               <div className="flex flex-wrap gap-1">
                  {statusFilters.map((filter) => (
                     <Button
                        key={filter.label}
                        variant={
                           (filters.status ?? '') === filter.value
                              ? 'default'
                              : 'outline'
                        }
                        size="sm"
                        onClick={() =>
                           router.get(
                              walletReports.url({
                                 query: filter.value
                                    ? { status: filter.value }
                                    : {},
                              }),
                           )
                        }
                     >
                        {filter.label}
                     </Button>
                  ))}
               </div>
            </div>

            <Table className="border-y border-border">
               <TableHeadRow>
                  <TableRow>
                     <TableHead>User</TableHead>
                     <TableHead>Transaction ID</TableHead>
                     <TableHead>Note</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead className="text-right">Amount</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
               </TableHeadRow>
               <TableBody>
                  {transactions.data.length ? (
                     transactions.data.map((txn) => (
                        <TableRow key={txn.id}>
                           <TableCell className="whitespace-nowrap">
                              <p className="text-sm font-medium">
                                 {txn.user?.name ?? '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 {txn.user?.email}
                              </p>
                           </TableCell>
                           <TableCell className="font-mono text-xs">
                              {txn.transaction_id || '-'}
                           </TableCell>
                           <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {txn.meta?.note || '-'}
                           </TableCell>
                           <TableCell>
                              <Badge className={statusVariant(txn.status)}>
                                 {txn.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-sm whitespace-nowrap">
                              {new Date(txn.created_at).toLocaleDateString()}
                           </TableCell>
                           <TableCell className="text-right text-sm font-semibold whitespace-nowrap text-green-600">
                              +{currency}{' '}
                              {Math.abs(Number(txn.amount)).toFixed(2)}
                           </TableCell>
                           <TableCell>
                              {txn.status === 'pending' ? (
                                 <div className="flex justify-end gap-1">
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
                                       onClick={() =>
                                          handleAction(txn.id, 'verify')
                                       }
                                    >
                                       <CheckCircle2 className="h-4 w-4" />
                                       Verify
                                    </Button>
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                                       onClick={() =>
                                          handleAction(txn.id, 'reject')
                                       }
                                    >
                                       <XCircle className="h-4 w-4" />
                                       Reject
                                    </Button>
                                 </div>
                              ) : (
                                 <p className="text-right text-xs text-muted-foreground">
                                    {txn.meta?.admin_notes || '-'}
                                 </p>
                              )}
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>

            {transactions.links?.length > 3 && (
               <div className="mt-4 flex flex-wrap items-center gap-1 p-5 pt-0">
                  {transactions.links.map((link, i) =>
                     link.url ? (
                        <Button
                           key={i}
                           variant={link.active ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => router.get(link.url as string)}
                           dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                     ) : (
                        <Button key={i} variant="outline" size="sm" disabled>
                           <span
                              dangerouslySetInnerHTML={{ __html: link.label }}
                           />
                        </Button>
                     ),
                  )}
               </div>
            )}
         </Card>
      </>
   );
};

WalletReports.layout = (children: ReactNode) => (
   <DashboardLayout>{children}</DashboardLayout>
);

export default WalletReports;
