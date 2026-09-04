import { Clock, ShoppingCart } from 'lucide-react';

interface ServiceItem {
   uuid: string;
   title: string;
   short_description?: string | null;
   price?: number;
   delivery_days?: number | null;
   thumbnail?: string | null;
   orders_count?: number;
   technician?: { id: number; name: string; photo?: string | null } | null;
}

interface ServicesGrid1Props {
   data?: {
      success?: boolean;
      collection?: ServiceItem[];
   } | null;
}

const ServicesGrid1 = ({ data }: ServicesGrid1Props) => {
   const services = data?.collection ?? [];

   if (services.length === 0) {
      return null;
   }

   return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
         {services.map((service) => (
            <a
               key={service.uuid}
               href={`/services/${service.uuid}`}
               className="group relative block overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg"
            >
               <div className="relative h-[280px] overflow-hidden">
                  {service.thumbnail ? (
                     <img
                        src={service.thumbnail}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                     />
                  ) : (
                     <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Clock className="h-12 w-12 text-muted-foreground/40" />
                     </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary-foreground/90 dark:via-primary-foreground/30" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                     <h3 className="text-xl font-bold">{service.title}</h3>
                     <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-semibold">
                           ${Number(service.price ?? 0).toFixed(2)}
                        </span>
                        <span className="rounded-full border border-white/60 px-3 py-1 text-xs font-medium transition-colors hover:border-white hover:bg-white hover:text-primary">
                           Lihat Detail
                        </span>
                     </div>
                  </div>

                  {service.technician && (
                     <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full bg-background/80 px-2.5 py-1 backdrop-blur-sm">
                        {service.technician.photo ? (
                           <img
                              src={service.technician.photo}
                              alt={service.technician.name}
                              className="h-6 w-6 rounded-full object-cover"
                           />
                        ) : (
                           <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {service.technician.name.charAt(0)}
                           </div>
                        )}
                        <span className="text-xs font-medium text-foreground">
                           {service.technician.name}
                        </span>
                     </div>
                  )}
               </div>

               <div className="p-5">
                  <h3 className="mb-2 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
                     {service.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                     {service.short_description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {service.delivery_days} hari
                     </span>
                     {service.orders_count !== undefined && (
                        <span className="flex items-center gap-1.5">
                           <ShoppingCart className="h-3.5 w-3.5" />
                           {service.orders_count} pesanan
                        </span>
                     )}
                  </div>
               </div>
            </a>
         ))}
      </div>
   );
};

export default ServicesGrid1;
