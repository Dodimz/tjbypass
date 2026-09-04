import { usePage } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ServiceCard from '@/components/cards/service-card';
import { Button } from '@/components/ui/button';
import {
   Carousel,
   CarouselContent,
   CarouselItem,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { useCarouselSlide } from '@/hooks/use-carousel-slide';
import { getPageSection } from '@/lib/page';
import { cn } from '@/lib/utils';
import Section from '../section';

const TopServices = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, topServices, customize } = props;
   const [api, setApi] = useState<CarouselApi>();
   const currentSlide = useCarouselSlide(api);
   const topServicesSection = getPageSection(page, 'top_services');

   return (
      <div className="overflow-y-hidden bg-[url('/assets/images/intro/home-1/bg-line.png')] bg-cover bg-center py-20">
         <Section
            customize={customize}
            pageSection={topServicesSection}
            containerClass=" relative"
         >
            <div className="relative z-10">
               <div className="mx-auto text-center md:max-w-xl">
                  <p className="mb-1 font-medium text-secondary-foreground">
                     {topServicesSection?.title}
                  </p>
                  <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                     {topServicesSection?.sub_title}
                  </h2>
                  <p className="text-muted-foreground">
                     {topServicesSection?.description}
                  </p>
               </div>

               <Carousel
                  setApi={setApi}
                  className="py-10"
                  opts={{ align: 'start', loop: true }}
                  plugins={[Autoplay({ delay: 3000 })]}
               >
                  <CarouselContent>
                     {topServices.map((service) => (
                        <CarouselItem
                           key={service.uuid}
                           className="basis-full md:basis-1/2 lg:basis-1/4"
                        >
                           <div className="px-1.5 py-0.5">
                              <ServiceCard
                                 key={service.uuid}
                                 service={service}
                              />
                           </div>
                        </CarouselItem>
                     ))}
                  </CarouselContent>
               </Carousel>

               <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center gap-2.5">
                     {api &&
                        topServices.map(({ uuid }, index) => (
                           <div
                              key={uuid}
                              className={cn(
                                 'cursor-pointer rounded-full transition-all duration-200',
                                 currentSlide === index
                                    ? 'h-2 w-4 bg-primary'
                                    : 'h-2 w-2 bg-gray-300',
                              )}
                              onClick={() => api.scrollTo(index)}
                           ></div>
                        ))}
                  </div>

                  <div className="space-x-4">
                     <Button
                        size="icon"
                        variant="outline"
                        disabled={!api?.canScrollPrev()}
                        onClick={() => api?.scrollPrev()}
                        className="hover:border-primary hover:bg-background"
                     >
                        <ChevronLeft />
                     </Button>
                     <Button
                        size="icon"
                        variant="outline"
                        disabled={!api?.canScrollNext()}
                        onClick={() => api?.scrollNext()}
                        className="hover:border-primary hover:bg-background"
                     >
                        <ChevronRight />
                     </Button>
                  </div>
               </div>
            </div>

            <div className="after:pointer-events-none after:absolute after:top-20 after:right-0 after:h-[240px] after:w-[240px] after:rounded-full after:bg-[rgba(97,95,255,1))] after:blur-[180px] after:content-['']"></div>
            <div className="after:pointer-events-none after:absolute after:bottom-20 after:left-0 after:h-[240px] after:w-[240px] after:rounded-full after:bg-[rgba(0,120,103,1)] after:blur-[180px] after:content-['']"></div>
         </Section>
      </div>
   );
};

export default TopServices;
