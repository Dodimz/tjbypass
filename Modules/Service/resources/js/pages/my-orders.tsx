import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { complete } from '@/routes/services/orders';
import { router, usePage } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';

interface MyOrderData {
   id: number;
   uuid: string;
   total: number;
   status: string;
   delivery_note: string | null;
   created_at: string;
   service: { title: string; uuid: string; delivery_days: number };
   technician?: { id: number; name: string } | null;
}

interface MyOrdersProps extends SharedData {
   orders: Pagination<MyOrderData>;
}

const statusVariant = (status: string) => {
   switch (status) {
      case 'completed':
         return 'default';
      case 'cancelled':
         return 'destructive';
      case 'delivered':
         return 'secondary';
      default:
         return 'outline';
   }
};

const MyOrders = () => {
   const { orders } = usePage<MyOrdersProps>().props;

   return (
      <>
         <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <h1 className="mb-6 text-2xl font-bold">My Service Orders</h1>

            {orders.data.length === 0 ? (
               <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                     You haven't ordered any services yet.
                  </p>
               </Card>
            ) : (
               <div className="space-y-4">
                  {orders.data.map((order) => (
                     <Card key={order.id} className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                           <div>
                              <h3 className="font-semibold">
                                 {order.service.title}
                              </h3>
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                 <Clock className="h-3.5 w-3.5" />
                                 Ordered{' '}
                                 {new Date(
                                    order.created_at,
                                 ).toLocaleDateString()}
                                 {' · '}
                                 {order.service.delivery_days} days delivery
                                 {order.technician
                                    ? ` · Technician: ${order.technician.name}`
                                    : ''}
                              </p>
                              {order.delivery_note && (
                                 <p className="mt-2 rounded-md bg-muted p-2 text-sm">
                                    <span className="font-medium">
                                       Seller note:{' '}
                                    </span>
                                    {order.delivery_note}
                                 </p>
                              )}
                           </div>

                           <div className="flex items-center gap-3">
                              <span className="font-bold">
                                 ${Number(order.total).toFixed(2)}
                              </span>
                              <Badge variant={statusVariant(order.status)}>
                                 {order.status.replace('_', ' ')}
                              </Badge>
                              {order.status === 'delivered' && (
                                 <Button
                                    size="sm"
                                    onClick={() =>
                                       router.post(complete.url(order.uuid))
                                    }
                                 >
                                    Confirm Completion
                                 </Button>
                              )}
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            )}

            {orders.last_page > 1 && (
               <div className="mt-8 flex justify-center gap-2">
                  {orders.links.map((link, i) => (
                     <a
                        key={i}
                        href={link.url ?? '#'}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                           link.active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                     />
                  ))}
               </div>
            )}
         </div>
      </>
   );
};

MyOrders.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default MyOrders;
