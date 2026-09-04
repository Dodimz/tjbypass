import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import Breadcrumbs from '@/components/breadcrumbs';
import LoadingButton from '@/components/loading-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import DashboardLayout from '@/layouts/dashboard/layout';
import { update as menusUpdate } from '@/routes/menus';

interface Props extends SharedData {
   menus: Settings<Record<string, boolean>>;
}

const menuItems = [
   {
      key: 'job-circulars',
      title: 'Job Circulars',
      description: 'Manage and publish job vacancy listings on your website.',
   },
   {
      key: 'newsletters',
      title: 'Newsletters',
      description:
         'Compose newsletters and send email campaigns to your subscribers.',
   },
   {
      key: 'certification',
      title: 'Certification',
      description:
         'Certificate and marksheet templates, plus student certificate pages.',
   },
   {
      key: 'courses',
      title: 'Courses',
      description:
         'Course categories, management, curriculum, and enrollments in the dashboard.',
   },
   {
      key: 'exams',
      title: 'Exams',
      description:
         'Exam categories, management, questions, attempts, and enrollments in the dashboard.',
   },
];

const Menus = ({ menus }: Props) => {
   const fields = menus.fields as Record<string, boolean>;

   const [visibility, setVisibility] = useState<Record<string, boolean>>(
      Object.fromEntries(
         menuItems.map(({ key }) => [key, fields[key] ?? true]),
      ),
   );

   return (
      <>
         <Breadcrumbs
            title="Menus"
            breadcrumbs={[
               { title: 'Dashboard', href: '/dashboard' },
               { title: 'Settings' },
               { title: 'Menus' },
            ]}
            className="mb-4"
         />

         <div className="grid grid-cols-1 gap-6 md:px-3 lg:grid-cols-3">
            <Card className="p-4 sm:p-6 lg:col-span-2">
               <Form
                  {...menusUpdate.form(Number(menus.id))}
                  transform={(formData) => ({
                     ...formData,
                     ...visibility,
                  })}
                  options={{ preserveScroll: true }}
                  className="space-y-6"
               >
                  {({ processing }) => (
                     <>
                        <div>
                           <h3 className="text-base font-semibold">
                              Dashboard Menus
                           </h3>
                           <p className="text-sm text-muted-foreground">
                              Hide menu groups you don't use. Hidden menus are
                              removed from the sidebar and their pages become
                              inaccessible until re-enabled.
                           </p>
                        </div>

                        <Separator />

                        {menuItems.map(({ key, title, description }) => (
                           <div
                              key={key}
                              className="flex items-center justify-between gap-4"
                           >
                              <div className="space-y-0.5">
                                 <Label className="text-base">{title}</Label>
                                 <p className="text-sm text-muted-foreground">
                                    {description}
                                 </p>
                              </div>
                              <Switch
                                 checked={visibility[key]}
                                 onCheckedChange={(checked) =>
                                    setVisibility((prev) => ({
                                       ...prev,
                                       [key]: checked,
                                    }))
                                 }
                              />
                           </div>
                        ))}

                        <LoadingButton
                           loading={processing}
                           className="float-end"
                        >
                           Save Changes
                        </LoadingButton>
                     </>
                  )}
               </Form>
            </Card>

            <Card className="space-y-5 py-6">
               <CardHeader>
                  <CardTitle className="text-lg">Good to know</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                     Hiding a menu does not delete any data. Everything stays
                     intact and comes back exactly as it was when you toggle the
                     menu on again.
                  </p>
                  <p>
                     Changes take effect for every user role immediately after
                     saving.
                  </p>
               </CardContent>
            </Card>
         </div>
      </>
   );
};

Menus.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default Menus;
