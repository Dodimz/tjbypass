import { usePage } from '@inertiajs/react';
import type { SortingState } from '@tanstack/react-table';
import {
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getSortedRowModel,
   useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import TableHeader from '@/components/table/table-header';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import TableColumn from './partials/services-table-columns';
import TableFilter from './partials/table-filter';
import TableFooter from './partials/table-footer';

interface ServicesProps {
   services: Pagination<any>;
   selectedIds?: number[];
   onCourseSelect?: (id: number) => void;
}

const Services = ({
   services,
   selectedIds = [],
   onCourseSelect,
}: ServicesProps) => {
   const page = usePage<IntroPageProps>();
   const routeName = page.props.type === 'demo' ? 'home.demo' : 'home';
   const routeParams =
      page.props.type === 'demo' ? { slug: page.props.page.slug } : undefined;
   const currency = page.props.system.fields['selling_currency'];

   const [sorting, setSorting] = React.useState<SortingState>([]);
   const table = useReactTable({
      data: services.data,
      columns: TableColumn(page.props.translate, currency),
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { sorting },
   });

   return (
      <div>
         <TableFilter
            data={services}
            title="Services"
            globalSearch={true}
            searchKey="service"
            tablePageSizes={[10, 15, 20, 25]}
            routeName={routeName}
            routeParams={routeParams}
         />

         <Table className="border-y border-border">
            <TableHeader table={table} />

            <TableBody>
               {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                     <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(
                           'cursor-pointer hover:bg-muted',
                           selectedIds?.includes(Number(row.original.id)) &&
                              'bg-secondary-100',
                        )}
                        onClick={() =>
                           onCourseSelect &&
                           onCourseSelect(Number(row.original.id))
                        }
                     >
                        {row.getVisibleCells().map((cell) => (
                           <TableCell key={cell.id}>
                              {flexRender(
                                 cell.column.columnDef.cell,
                                 cell.getContext(),
                              )}
                           </TableCell>
                        ))}
                     </TableRow>
                  ))
               ) : (
                  <TableRow>
                     <TableCell className="h-24 text-center">
                        {page.props.translate.common.no_results_found}
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>

         <TableFooter
            className="p-4"
            routeName={routeName}
            routeParams={routeParams}
            paginationInfo={services}
         />
      </div>
   );
};

export default Services;
