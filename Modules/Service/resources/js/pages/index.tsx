import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LandingLayout from '@/layouts/landing';
import guestIndex from '@/routes/services/guest';
import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, Search, User } from 'lucide-react';
import * as React from 'react';
import type { ReactNode } from 'react';

export interface ServiceData {
   id: number;
   uuid: string;
   title: string;
   slug: string;
   short_description: string | null;
   description: string | null;
   price: number;
   delivery_days: number;
   status: string;
   thumbnail: string | null;
   technician_id?: number | null;
   technician?: { id: number; name: string } | null;
}

interface ServicesPageProps extends SharedData {
   services: Pagination<ServiceData>;
   search: string | null;
}

const ServicesIndex = () => {
   const { props } = usePage<ServicesPageProps>();
   const { services, search } = props;
   const [term, setTerm] = React.useState(search ?? '');

   const submitSearch = (e: React.FormEvent) => {
      e.preventDefault();
      window.location.href = guestIndex.index.url({
         query: term ? { search: term } : {},
      });
   };

   return (
      <>
         <Head title="Digital Services" />

         <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
               <h1 className="mb-3 text-4xl font-bold tracking-tight">
                  Digital Services
               </h1>
               <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Professional digital services delivered by our team.
               </p>

               <form
                  onSubmit={submitSearch}
                  className="mx-auto mt-6 flex max-w-md items-center gap-2"
               >
                  <input
                     type="text"
                     value={term}
                     onChange={(e) => setTerm(e.target.value)}
                     placeholder="Search services..."
                     className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <Button type="submit" size="sm">
                     <Search className="mr-1 h-4 w-4" />
                     Search
                  </Button>
               </form>
            </div>

            {services.data.length === 0 ? (
               <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                     No services available yet. Check back soon!
                  </p>
               </Card>
            ) : (
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.data.map((service) => (
                     <Card
                        key={service.id}
                        className="group overflow-hidden pt-0"
                     >
                        <Link href={guestIndex.show.url(service.uuid)}>
                           <div className="aspect-video overflow-hidden bg-muted">
                              {service.thumbnail ? (
                                 <img
                                    src={service.thumbnail}
                                    alt={service.title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                 />
                              ) : (
                                 <div className="flex h-full w-full items-center justify-center">
                                    <Clock className="h-10 w-10 text-muted-foreground" />
                                 </div>
                              )}
                           </div>
                           <div className="p-5">
                              <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
                                 {service.title}
                              </h3>
                              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                                 {service.short_description}
                              </p>

                              <div className="flex items-center justify-between">
                                 <span className="text-xl font-bold text-primary">
                                    ${Number(service.price).toFixed(2)}
                                 </span>
                                 <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {service.delivery_days} days
                                 </span>
                              </div>
                              {service.technician && (
                                 <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    {service.technician.name}
                                 </p>
                              )}
                           </div>
                        </Link>
                     </Card>
                  ))}
               </div>
            )}

            {services.last_page > 1 && (
               <div className="mt-10 flex justify-center gap-2">
                  {services.links.map((link, i) => (
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

ServicesIndex.layout = (page: ReactNode) => <LandingLayout children={page} />;

export default ServicesIndex;
