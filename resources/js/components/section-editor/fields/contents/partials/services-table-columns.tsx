import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { systemCurrency } from '@/lib/utils';

const ServicesTableColumn = (
   translate: LanguageTranslations,
   currency: string,
): ColumnDef<any>[] => [
   {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
         <div className="capitalize">{row.getValue('title')}</div>
      ),
   },
   {
      accessorKey: 'price',
      header: ({ column }) => (
         <div className="flex items-center justify-center">
            <Button
               type="button"
               variant="ghost"
               onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
               }
            >
               Price
               <ArrowUpDown />
            </Button>
         </div>
      ),
      cell: ({ row }) => {
         const { amount } = systemCurrency(currency);
         return (
            <div className="text-center">
               <p>{amount(row.original.price)}</p>
            </div>
         );
      },
   },
   {
      accessorKey: 'delivery_days',
      header: 'Delivery Days',
      cell: ({ row }) => (
         <div className="text-center">
            <p>{row.original.delivery_days} hari</p>
         </div>
      ),
   },
];

export default ServicesTableColumn;
