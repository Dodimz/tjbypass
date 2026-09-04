import Breadcrumbs from '@/components/breadcrumbs';
import ActionsDropdown from '@/components/actions-dropdown';
import TableFilter from '@/components/table/table-filter';
import TableFooter from '@/components/table/table-footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader as UiTableHeader,
   TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/layouts/dashboard/layout';
import { create, destroy, edit } from '@/routes/services';
import guestShow from '@/routes/services/guest';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ServiceData } from '../index';

interface ServicesDashboardProps extends SharedData {
   services: Pagination<ServiceData>;
   filters: { search?: string | null; status?: string | null };
}

const ServicesIndex = () => {
   const { props } = usePage<ServicesDashboardProps>();
   const { services } = props;

   return (
      <>
         <Breadcrumbs
            title="Services"
            breadcrumbs={[
               { title: 'Dashboard', href: '/dashboard' },
               { title: 'Services' },
            ]}
            action={
               <Button asChild>
                  <Link href={create()}>
                     <Plus className="mr-2 h-4 w-4" />
                     New Service
                  </Link>
               </Button>
            }
            className="mb-4"
         />

         <Card>
            <TableFilter
               data={services}
               title="Services"
               globalSearch={true}
               tablePageSizes={[10, 15, 20, 25]}
               routeName="services.index"
               filterKey="services"
            />

            <Table className="border-y border-border">
               <UiTableHeader>
                  <TableRow>
                     <TableHead className="pl-4">Title</TableHead>
                     <TableHead className="text-center">Price</TableHead>
                     <TableHead className="text-center">Delivery</TableHead>
                     <TableHead className="text-center">Status</TableHead>
                     <TableHead className="pr-4 text-end">Action</TableHead>
                  </TableRow>
               </UiTableHeader>
               <TableBody>
                  {services.data.length ? (
                     services.data.map((service) => (
                        <TableRow key={service.id}>
                           <TableCell className="py-3 pl-4">
                              <Link
                                 className="font-medium hover:underline"
                                 href={edit(service.uuid)}
                              >
                                 {service.title}
                              </Link>
                           </TableCell>
                           <TableCell className="text-center">
                              ${Number(service.price).toFixed(2)}
                           </TableCell>
                           <TableCell className="text-center">
                              {service.delivery_days} days
                           </TableCell>
                           <TableCell className="text-center capitalize">
                              {service.status}
                           </TableCell>
                           <TableCell className="pr-4">
                              <div className="flex justify-end">
                                 <ActionsDropdown
                                    routes={[
                                       {
                                          label: 'Delete',
                                          method: 'delete',
                                          route: destroy.url(service.uuid),
                                          message:
                                             'Are you sure you want to delete this service?',
                                       },
                                    ]}
                                    component={
                                       <>
                                          <Button
                                             asChild
                                             variant="ghost"
                                             size="sm"
                                             className="w-full justify-start has-[svg]:!px-2"
                                          >
                                             <a
                                                target="_blank"
                                                href={guestShow.show.url(
                                                   service.uuid,
                                                )}
                                             >
                                                View
                                             </a>
                                          </Button>
                                          <Button
                                             variant="ghost"
                                             size="sm"
                                             className="w-full justify-start has-[svg]:!px-2"
                                             onClick={() =>
                                                router.get(edit(service.uuid))
                                             }
                                          >
                                             Edit
                                          </Button>
                                       </>
                                    }
                                 />
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                           No services found.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>

            <TableFooter
               className="p-4 sm:p-6"
               routeName="services.index"
               paginationInfo={services}
               paginationKey="services"
            />
         </Card>
      </>
   );
};

ServicesIndex.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default ServicesIndex;
