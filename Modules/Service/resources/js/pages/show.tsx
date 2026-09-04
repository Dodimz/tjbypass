import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LandingLayout from '@/layouts/landing';
import { systemCurrency } from '@/lib/utils';
import guestShow from '@/routes/services/guest';
import payments from '@/routes/payments';
import login from '@/routes/login';
import { Head, usePage } from '@inertiajs/react';
import { Clock, CheckCircle2, User } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ServiceData } from './index';

interface ServiceShowProps extends SharedData {
   service: ServiceData;
}

const ServiceShow = () => {
   const { auth, system } = usePage<ServiceShowProps>().props;
   const { service } = usePage<ServiceShowProps>().props;
   const { amount } = systemCurrency(system.fields['selling_currency']);

   const orderUrl = payments.index.url({
      from: 'web',
      item: 'service',
      id: service.uuid,
   });

   return (
      <>
         <Head title={service.title} />

         <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
               <div className="lg:col-span-2">
                  <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-muted">
                     {service.thumbnail ? (
                        <img
                           src={service.thumbnail}
                           alt={service.title}
                           className="h-full w-full object-cover"
                        />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center">
                           <Clock className="h-16 w-16 text-muted-foreground" />
                        </div>
                     )}
                  </div>

                  <h1 className="mb-4 text-3xl font-bold tracking-tight">
                     {service.title}
                  </h1>
                  <p className="mb-6 text-lg text-muted-foreground">
                     {service.short_description}
                  </p>

                  <div
                     className="prose max-w-none"
                     dangerouslySetInnerHTML={{
                        __html: service.description ?? '',
                     }}
                  />
               </div>

               <div>
                  <Card className="sticky top-6 p-6">
                     <div className="mb-4 flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-primary">
                           {amount(Number(service.price))}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                           <Clock className="h-4 w-4" />
                           {service.delivery_days} days delivery
                        </span>
                     </div>

                     <ul className="mb-6 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                           <User className="h-4 w-4 text-primary" />
                           Technician:{' '}
                           {service.technician?.name ?? 'In-house team'}
                        </li>
                        <li className="flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                           Professional delivery
                        </li>
                        <li className="flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                           {service.delivery_days}-day turnaround
                        </li>
                        <li className="flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                           Secure payment
                        </li>
                     </ul>

                     {auth.user ? (
                        <Button asChild className="w-full" size="lg">
                           <a href={orderUrl}>Order Now</a>
                        </Button>
                     ) : (
                        <Button asChild className="w-full" size="lg">
                           <a href={login.index.url()}>Login to Order</a>
                        </Button>
                     )}
                  </Card>
               </div>
            </div>
         </div>
      </>
   );
};

ServiceShow.layout = (page: ReactNode) => <LandingLayout children={page} />;

export default ServiceShow;
