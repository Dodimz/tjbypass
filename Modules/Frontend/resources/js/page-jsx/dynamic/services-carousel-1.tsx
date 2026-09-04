import { Button } from '@/components/ui/button';
import {
   Carousel,
   CarouselContent,
   CarouselItem,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { cn, systemCurrency } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { Clock, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface Props {
   data?: {
      collection?: ServiceItem[];
   } | null;
}

const ServiceCard = ({ service }: { service: ServiceItem }) => {
   return (
      <a
         href={`/services/${service.uuid}`}
         className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg"
      >
         <div className="relative h-[190px] overflow-hidden">
            {service.thumbnail ? (
               <img
                  src={service.thumbnail}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
               />
            ) : (
               <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Clock className="h-10 w-10 text-muted-foreground/40" />
               </div>
            )}

            {service.technician && (
               <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-0.5 backdrop-blur-sm">
                  {service.technician.photo ? (
                     <img
                        src={service.technician.photo}
                        alt={service.technician.name}
                        className="h-5 w-5 rounded-full object-cover"
                     />
                  ) : (
                     <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {service.technician.name.charAt(0)}
                     </div>
                  )}
                  <span className="text-[11px] font-medium text-foreground">
                     {service.technician.name}
                  </span>
               </div>
            )}
         </div>

         <div className="p-4">
            <div className="mb-1 flex items-center gap-3 text-xs text-secondary-foreground">
               <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.delivery_days} hari
               </span>
               {service.orders_count !== undefined && (
                  <span className="flex items-center gap-1">
                     <ShoppingCart className="h-3 w-3" />
                     {service.orders_count}
                  </span>
               )}
            </div>

            <p className="line-clamp-1 font-semibold hover:text-secondary-foreground">
               {service.title}
            </p>

            {service.short_description && (
               <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {service.short_description}
               </p>
            )}
         </div>

         <div className="flex items-center justify-between px-4 pb-4">
            <p className="font-semibold">
               ${Number(service.price ?? 0).toFixed(2)}
            </p>
            <span className="rounded-md border border-secondary-100 px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-background">
               Learn More
            </span>
         </div>
      </a>
   );
};

const ServicesCarousel1 = ({ data }: Props) => {
   const services = data?.collection ?? [];
   const [api, setApi] = useState<CarouselApi>();
   const [currentSlide, setCurrentSlide] = useState(0);

   useEffect(() => {
      if (!api) {
         return;
      }

      const handleSelect = () => {
         setCurrentSlide(api.selectedScrollSnap());
      };

      api.on('select', handleSelect);

      return () => {
         api.off('select', handleSelect);
      };
   }, [api]);

   if (services.length === 0) {
      return null;
   }

   return (
      <>
         <Carousel
            setApi={setApi}
            className="py-10"
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 3000 })]}
         >
            <CarouselContent>
               {services.map((service) => (
                  <CarouselItem
                     key={service.uuid}
                     className="basis-full md:basis-1/2 lg:basis-1/4"
                  >
                     <div className="px-1.5 py-0.5">
                        <ServiceCard service={service} />
                     </div>
                  </CarouselItem>
               ))}
            </CarouselContent>
         </Carousel>

         <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2.5">
               {services.map(({ uuid }, index) => (
                  <div
                     key={uuid}
                     className={cn(
                        'cursor-pointer rounded-full transition-all duration-200',
                        currentSlide === index
                           ? 'h-2 w-4 bg-foreground'
                           : 'h-2 w-2 bg-gray-300 dark:bg-gray-600',
                     )}
                     onClick={() => api?.scrollTo(index)}
                  />
               ))}
            </div>

            <div className="space-x-4">
               <Button
                  size="icon"
                  variant="outline"
                  disabled={!api?.canScrollPrev()}
                  onClick={() => api?.scrollPrev()}
                  className="hover:bg-background"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <path d="m15 18-6-6 6-6" />
                  </svg>
               </Button>
               <Button
                  size="icon"
                  variant="outline"
                  disabled={!api?.canScrollNext()}
                  onClick={() => api?.scrollNext()}
                  className="hover:bg-background"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <path d="m9 18 6-6-6-6" />
                  </svg>
               </Button>
            </div>
         </div>
      </>
   );
};

export default ServicesCarousel1;
