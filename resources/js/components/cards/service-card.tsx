import { Link, usePage } from '@inertiajs/react';
import { Clock, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn, systemCurrency } from '@/lib/utils';
import { show } from '@/routes/services/guest';

interface Props {
   service: {
      uuid: string;
      title: string;
      short_description?: string;
      price: number;
      delivery_days: number;
      thumbnail?: string | null;
      orders_count?: number;
      technician?: { id: number; name: string; photo?: string | null } | null;
   };
   className?: string;
}

const ServiceCard = ({ service, className }: Props) => {
   const { props } = usePage<SharedData>();
   const { translate } = props;
   const { common } = translate;
   const { amount } = systemCurrency(props.system.fields['selling_currency']);

   return (
      <Card className={cn('group p-0', className)}>
         <CardHeader className="p-0">
            <div className="p-2 pb-0">
               <Link href={show({ service: service.uuid })}>
                  <div className="relative h-[320px] overflow-hidden rounded-lg">
                     <img
                        src={
                           service.thumbnail ||
                           '/assets/images/blank-image.jpg'
                        }
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.src = '/assets/images/blank-image.jpg';
                        }}
                     />

                     <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary-foreground/90 dark:via-primary-foreground/40" />

                     <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xl font-bold">{service.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                           <p className="text-lg font-semibold">
                              {amount(service.price)}
                           </p>
                           <Button
                              variant="outline"
                              size="sm"
                              className="border-white text-white hover:bg-white hover:text-primary dark:hover:text-primary-foreground"
                           >
                              {common.learn_more ?? 'Learn More'}
                           </Button>
                        </div>
                     </div>

                     {service.technician && (
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full bg-background/80 px-2 py-1 backdrop-blur">
                           <Avatar className="h-7 w-7">
                              <AvatarImage
                                 src={service.technician.photo || ''}
                                 alt={service.technician.name}
                                 className="object-cover"
                              />
                              <AvatarFallback>
                                 {service.technician.name.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                           <span className="text-xs font-medium text-foreground">
                              {service.technician.name}
                           </span>
                        </div>
                     )}
                  </div>
               </Link>
            </div>
         </CardHeader>

         <CardContent className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-4 text-xs text-secondary-foreground">
               <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {service.delivery_days}{' '}
                  {service.delivery_days > 1 ? 'hari' : 'hari'}
               </span>
               {service.orders_count !== undefined && (
                  <span className="flex items-center gap-1.5">
                     <ShoppingCart className="h-3 w-3" />
                     {service.orders_count} pesanan
                  </span>
               )}
            </div>
         </CardContent>
      </Card>
   );
};

export default ServiceCard;
