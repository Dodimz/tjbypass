import Breadcrumbs from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard/layout';
import { systemCurrency } from '@/lib/utils';
import { index, store, update } from '@/routes/services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, type FormEvent, type ReactNode } from 'react';
import type { ServiceData } from '../index';

interface TechnicianData {
    id: number;
    name: string;
}

interface ServiceFormProps extends SharedData {
    service: ServiceData | null;
    statuses: Record<string, string>;
    technicians: TechnicianData[];
}

const CreateEdit = () => {
    const { service, statuses, technicians, system } =
        usePage<ServiceFormProps>().props;
    const isEdit = !!service;
    const { currency } = systemCurrency(system.fields['selling_currency']);

    const { data, setData, post, processing, errors, transform } = useForm<{
        title: string;
        short_description: string;
        description: string;
        price: string;
        delivery_days: string;
        status: string;
        technician_id: string;
        thumbnail: File | null;
        _method?: 'post';
    }>({
        title: service?.title ?? '',
        short_description: service?.short_description ?? '',
        description: service?.description ?? '',
        price: service ? String(service.price) : '',
        delivery_days: service ? String(service.delivery_days) : '3',
        status: service?.status ?? 'draft',
        technician_id: service?.technician_id
            ? String(service.technician_id)
            : 'none',
        thumbnail: null,
    });

   transform((form) => ({
      ...form,
      technician_id:
         form.technician_id === 'none' ? '' : form.technician_id,
   }));

   const technicianOptions = useMemo(() => {
      const list = [...technicians];

      if (
         service?.technician &&
         !list.some((t) => t.id === service.technician!.id)
      ) {
         list.unshift({
            id: service.technician.id,
            name: `${service.technician.name} (assigned)`,
         });
      }

      return list;
   }, [service, technicians]);

   const submit = (e: FormEvent) => {
      e.preventDefault();

      if (isEdit) {
         post(update.url(service!.uuid), { forceFormData: true });
      } else {
         post(store.url());
      }
   };

   return (
      <>
         <Head title={isEdit ? 'Edit Service' : 'Create Service'} />

         <Breadcrumbs
            title={isEdit ? 'Edit Service' : 'Create Service'}
            breadcrumbs={[
               { title: 'Dashboard', href: '/dashboard' },
               { title: 'Services', href: index.url() },
               { title: isEdit ? 'Edit' : 'Create' },
            ]}
            className="mb-4"
         />

         <Card className="mx-auto max-w-3xl p-6">
            <form onSubmit={submit} className="space-y-5">
               <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                     id="title"
                     value={data.title}
                     onChange={(e) => setData('title', e.target.value)}
                     placeholder="e.g. Professional Logo Design"
                  />
                  {errors.title && (
                     <p className="text-sm text-red-500">{errors.title}</p>
                  )}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                     id="short_description"
                     value={data.short_description}
                     onChange={(e) =>
                        setData('short_description', e.target.value)
                     }
                     placeholder="A brief summary shown on the listing card"
                     rows={2}
                  />
                  {errors.short_description && (
                     <p className="text-sm text-red-500">
                        {errors.short_description}
                     </p>
                  )}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                     id="description"
                     value={data.description}
                     onChange={(e) => setData('description', e.target.value)}
                     placeholder="Describe what the buyer gets..."
                     rows={6}
                  />
                  {errors.description && (
                     <p className="text-sm text-red-500">
                        {errors.description}
                     </p>
                  )}
               </div>

               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                      <Label htmlFor="price">Price ({currency?.value ?? 'USD'}) *</Label>
                     <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                     />
                     {errors.price && (
                        <p className="text-sm text-red-500">{errors.price}</p>
                     )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="delivery_days">Delivery Days *</Label>
                     <Input
                        id="delivery_days"
                        type="number"
                        min="1"
                        max="365"
                        value={data.delivery_days}
                        onChange={(e) =>
                           setData('delivery_days', e.target.value)
                        }
                     />
                     {errors.delivery_days && (
                        <p className="text-sm text-red-500">
                           {errors.delivery_days}
                        </p>
                     )}
                  </div>

                  <div className="space-y-2">
                     <Label>Status</Label>
                     <Select
                        value={data.status}
                        onValueChange={(v) => setData('status', v)}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                           {(
                              Object.entries(statuses) as [string, string][]
                           ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                 {label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {errors.status && (
                        <p className="text-sm text-red-500">{errors.status}</p>
                     )}
                  </div>
               </div>

               <div className="space-y-2">
                  <Label>Technician</Label>
                  <Select
                     value={data.technician_id}
                     onValueChange={(v) => setData('technician_id', v)}
                  >
                     <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">
                           — No technician (default: admin) —
                        </SelectItem>
                        {technicianOptions.map((t) => (
                           <SelectItem key={t.id} value={String(t.id)}>
                              {t.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                     Technician assigned to work on orders for this
                     service. Leave empty to assign yourself (admin) as
                     the default technician.
                  </p>
                  {errors.technician_id && (
                     <p className="text-sm text-red-500">
                        {errors.technician_id}
                     </p>
                  )}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <Input
                     id="thumbnail"
                     type="file"
                     accept="image/jpeg,image/png,image/webp"
                     onChange={(e) =>
                        setData(
                           'thumbnail',
                           (e.target.files?.[0] as File) ?? null,
                        )
                     }
                  />
                  {errors.thumbnail && (
                     <p className="text-sm text-red-500">{errors.thumbnail}</p>
                  )}
               </div>

               <div className="flex justify-end gap-3 pt-2">
                  <Button asChild variant="outline" type="button">
                     <Link href={index()}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={processing}>
                     {isEdit ? 'Update Service' : 'Create Service'}
                  </Button>
               </div>
            </form>
         </Card>
      </>
   );
};

CreateEdit.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default CreateEdit;
