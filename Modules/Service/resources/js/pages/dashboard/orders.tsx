import Breadcrumbs from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
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
import serviceOrders from '@/routes/services/orders';
import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface ServiceOrderData {
    id: number;
    uuid: string;
    price: number;
    tax: number;
    total: number;
    requirements: string | null;
    delivery_note: string | null;
    status: string;
    created_at: string;
    service: { title: string; uuid: string };
    user: { name: string; email: string };
    technician?: { id: number; name: string } | null;
}

interface OrdersDashboardProps extends SharedData {
    orders: Pagination<ServiceOrderData>;
    filters: { status?: string | null };
}

const statusVariant = (status: string) => {
    switch (status) {
        case 'completed':
            return 'default';
        case 'cancelled':
            return 'destructive';
        case 'paid':
        case 'delivered':
            return 'secondary';
        case 'in_progress':
            return 'outline';
        default:
            return 'outline';
    }
};

const OrdersIndex = () => {
    const { orders, auth } = usePage<OrdersDashboardProps>().props;
    const isAdmin = auth.user.role === 'admin';

    const start = (uuid: string) =>
        router.post(serviceOrders.start.url(uuid));
    const deliver = (uuid: string) =>
        router.post(serviceOrders.deliver.url(uuid), {
            delivery_note: window.prompt('Delivery note (optional):') ?? '',
        });
    const complete = (uuid: string) =>
        router.post(serviceOrders.complete.url(uuid));

    return (
        <>
            <Breadcrumbs
                title="Service Orders"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Services', href: '/dashboard/services' },
                    { title: 'Orders' },
                ]}
                className="mb-4"
            />

            <Card>
                <Table className="border-y border-border">
                    <UiTableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Customer</TableHead>
                            <TableHead>Service</TableHead>
                            {isAdmin && <TableHead>Technician</TableHead>}
                            <TableHead className="text-center">
                                Total
                            </TableHead>
                            <TableHead className="text-center">
                                Status
                            </TableHead>
                            <TableHead className="pr-4 text-end">
                                Action
                            </TableHead>
                        </TableRow>
                    </UiTableHeader>
                    <TableBody>
                        {orders.data.length ? (
                            orders.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="py-3 pl-4">
                                        <p className="font-medium">
                                            {order.user?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.user?.email}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {order.service.title}
                                        {order.requirements && (
                                            <p
                                                className="mt-1 max-w-48 truncate text-xs text-muted-foreground"
                                                title={order.requirements}
                                            >
                                                Brief:{' '}
                                                {order.requirements}
                                            </p>
                                        )}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            {order.technician?.name ?? '—'}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center">
                                        ${Number(order.total).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={statusVariant(
                                                order.status,
                                            )}
                                        >
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <div className="flex justify-end gap-2">
                                            {order.status === 'paid' &&
                                                !isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            start(order.uuid)
                                                        }
                                                    >
                                                        Start Working
                                                    </Button>
                                                )}

                                            {(order.status === 'paid' ||
                                                order.status ===
                                                    'in_progress' ||
                                                order.status ===
                                                    'delivered') &&
                                                isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            complete(
                                                                order.uuid,
                                                            )
                                                        }
                                                    >
                                                        Mark Completed
                                                    </Button>
                                                )}

                                            {order.status ===
                                                'in_progress' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        deliver(order.uuid)
                                                    }
                                                >
                                                    Deliver
                                                </Button>
                                            )}

                                            {order.status === 'delivered' &&
                                                !isAdmin && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            complete(
                                                                order.uuid,
                                                            )
                                                        }
                                                    >
                                                        Mark Completed
                                                    </Button>
                                                )}

                                            {isAdmin &&
                                                order.status !==
                                                    'completed' &&
                                                order.status !==
                                                    'cancelled' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                serviceOrders.cancel.url(
                                                                    order.uuid,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 6 : 5}
                                    className="h-24 text-center"
                                >
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {orders.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {orders.links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url ?? '#'}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                            className={`rounded-md border px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

OrdersIndex.layout = (page: ReactNode) => (
    <DashboardLayout children={page} />
);

export default OrdersIndex;
