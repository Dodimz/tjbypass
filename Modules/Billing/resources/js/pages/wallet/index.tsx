import Breadcrumbs from '@/components/breadcrumbs';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader as TableHeadRow,
   TableRow,
} from '@/components/ui/table';
import Main from '@/layouts/main';
import { deposit, index as walletIndex } from '@/routes/wallet';
import { router, useForm, usePage } from '@inertiajs/react';
import {
   ArrowDownLeft,
   ArrowUpRight,
   Info,
   Wallet as WalletIcon,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

interface WalletTransactionData {
   id: number;
   type: string;
   amount: string;
   balance_after: string;
   status: string;
   transaction_id: string | null;
   description: string | null;
   created_at: string;
}

interface WalletProps extends SharedData {
   balance: number;
   transactions: {
      data: WalletTransactionData[];
      links: { url: string | null; label: string; active: boolean }[];
   };
   currency: string;
   payment_instructions: string;
   payment_details: string;
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

const Index = () => {
   const { props } = usePage<WalletProps>();
   const {
      balance,
      transactions,
      currency,
      payment_instructions,
      payment_details,
   } = props;

   const { data, setData, post, processing, errors, reset } = useForm({
      amount: '',
      note: '',
   });

   const quickAmounts = [10, 25, 50, 100];

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault();

      post(deposit.url(), {
         onSuccess: () => reset('amount', 'note'),
      });
   };

   return (
      <div className="mx-auto w-full max-w-[1100px] p-6 py-8">
         <Breadcrumbs
            title="My Wallet"
            breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'My Wallet' }]}
            className="mb-4"
         />

         <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Balance card */}
            <Card className="lg:col-span-1">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                     <WalletIcon className="h-5 w-5 text-blue-500" />
                     Current Balance
                  </CardTitle>
                  <CardDescription>
                     Available balance in your wallet
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                     {currency} {Number(balance).toFixed(2)}
                  </p>
               </CardContent>
            </Card>

            {/* Deposit form */}
            <Card className="lg:col-span-2">
               <CardHeader>
                  <CardTitle className="text-lg">Add Balance</CardTitle>
                  <CardDescription>
                     Submit a deposit request. Your balance will be credited
                     after our team verifies your transfer.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="amount">
                           Amount ({currency}){' '}
                           <span className="text-red-500">*</span>
                        </Label>
                        <Input
                           required
                           id="amount"
                           type="number"
                           min="1"
                           step="0.01"
                           placeholder="0.00"
                           value={data.amount}
                           onChange={(e) => setData('amount', e.target.value)}
                        />
                        <InputError message={errors.amount} />
                     </div>

                     <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((value) => (
                           <Button
                              key={value}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setData('amount', String(value))}
                           >
                              {currency} {value}
                           </Button>
                        ))}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="note">
                           Note <span className="font-light">(Optional)</span>
                        </Label>
                        <Input
                           id="note"
                           type="text"
                           placeholder="e.g. Bank transfer reference number"
                           value={data.note}
                           onChange={(e) => setData('note', e.target.value)}
                        />
                        <InputError message={errors.note} />
                     </div>

                     {(payment_instructions || payment_details) && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                           <p className="mb-2 flex items-center gap-2 font-medium text-blue-800">
                              <Info className="h-4 w-4" />
                              Transfer Details
                           </p>
                           {payment_details && (
                              <div
                                 className="prose prose-sm max-w-none text-sm text-gray-700"
                                 dangerouslySetInnerHTML={{
                                    __html: payment_details,
                                 }}
                              />
                           )}
                           {payment_instructions && (
                              <div
                                 className="prose prose-sm mt-2 max-w-none text-sm text-gray-700"
                                 dangerouslySetInnerHTML={{
                                    __html: payment_instructions,
                                 }}
                              />
                           )}
                        </div>
                     )}

                     <Button type="submit" disabled={processing}>
                        {processing
                           ? 'Submitting...'
                           : 'Submit Deposit Request'}
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>

         {/* Transaction history */}
         <Card className="mt-6">
            <CardHeader>
               <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeadRow>
                     <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                           Balance After
                        </TableHead>
                     </TableRow>
                  </TableHeadRow>
                  <TableBody>
                     {transactions.data.length ? (
                        transactions.data.map((txn) => (
                           <TableRow key={txn.id}>
                              <TableCell className="text-sm whitespace-nowrap">
                                 {new Date(txn.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="max-w-[220px] truncate text-sm">
                                 {txn.description || txn.transaction_id || '-'}
                              </TableCell>
                              <TableCell>
                                 <Badge variant="outline">{txn.type}</Badge>
                              </TableCell>
                              <TableCell>
                                 <Badge className={statusVariant(txn.status)}>
                                    {txn.status}
                                 </Badge>
                              </TableCell>
                              <TableCell
                                 className={`flex items-center justify-end gap-1 text-right text-sm font-semibold whitespace-nowrap ${
                                    Number(txn.amount) >= 0
                                       ? 'text-green-600'
                                       : 'text-red-600'
                                 }`}
                              >
                                 {Number(txn.amount) >= 0 ? (
                                    <ArrowDownLeft className="h-4 w-4" />
                                 ) : (
                                    <ArrowUpRight className="h-4 w-4" />
                                 )}
                                 {currency}{' '}
                                 {Math.abs(Number(txn.amount)).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-sm whitespace-nowrap">
                                 {currency}{' '}
                                 {Number(txn.balance_after).toFixed(2)}
                              </TableCell>
                           </TableRow>
                        ))
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                           >
                              No transactions yet.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>

               {transactions.links?.length > 3 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1">
                     {transactions.links.map((link, i) =>
                        link.url ? (
                           <Button
                              key={i}
                              variant={link.active ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => router.get(link.url as string)}
                              dangerouslySetInnerHTML={{
                                 __html: link.label,
                              }}
                           />
                        ) : (
                           <Button key={i} variant="outline" size="sm" disabled>
                              <span
                                 dangerouslySetInnerHTML={{
                                    __html: link.label,
                                 }}
                              />
                           </Button>
                        ),
                     )}
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
};

Index.layout = (page: ReactNode) => <Main children={page} />;

export default Index;
