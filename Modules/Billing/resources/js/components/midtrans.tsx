import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import Switch from '@/components/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import midtransCurrencies from '@/data/currencies/midtrans';
import { cn } from '@/lib/utils';
import { update as paymentUpdate } from '@/routes/payment-gateways';
import { update as payoutUpdate } from '@/routes/payouts/settings';
import { Form, useForm, usePage } from '@inertiajs/react';

interface MidtransProps {
   payment: Settings<MidtransFields>;
   type: 'payout' | 'payment';
}

const Midtrans = ({ payment, type }: MidtransProps) => {
   const { props } = usePage<SharedData>();
   const { translate } = props;
   const { settings, input, button, common } = translate;

   const { data, setData } = useForm({
      active: payment.fields.active,
      test_mode: payment.fields.test_mode,
   });

   const formProps =
      type === 'payment' ? paymentUpdate.form(payment.id) : payoutUpdate.form();

   return (
      <Form
         {...formProps}
         transform={(formData) => ({
            ...payment.fields,
            ...formData,
            ...data,
            type: 'midtrans',
         })}
         className="space-y-6 rounded-lg border bg-card p-4 sm:p-6"
      >
         {({ processing, errors }) => {
            return (
               <>
                  <div className="flex items-center justify-between pb-2">
                     <h2 className="text-xl font-semibold">Midtrans Settings</h2>

                     <div className="flex items-center space-x-2">
                        <Label htmlFor="status" className="mb-0">
                           {payment.fields.active
                              ? common.enabled
                              : common.disabled}
                        </Label>
                        <Switch
                           id="status"
                           defaultChecked={data.active}
                           onCheckedChange={(checked) => {
                              setData('active', checked);
                           }}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <div>
                        <Label>{input.currency}</Label>
                        <Select
                           name="currency"
                           defaultValue={payment.fields.currency ?? ''}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder={input.currency} />
                           </SelectTrigger>
                           <SelectContent>
                              {midtransCurrencies.map((c) => (
                                 <SelectItem key={c.value} value={c.value}>
                                    {c.label} ({c.value})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <InputError message={errors.currency} />
                     </div>

                     <div>
                        <span className="mb-3 block text-sm font-medium">
                           {settings.test_mode}:
                        </span>
                        <div className="flex items-center space-x-2">
                           <Switch
                              id="test_mode"
                              defaultChecked={data.test_mode}
                              onCheckedChange={(checked) => {
                                 setData('test_mode', checked);
                              }}
                           />
                           <Label
                              htmlFor="test_mode"
                              className="mb-0 text-gray-500"
                           >
                              {data.test_mode
                                 ? settings.using_test_keys
                                 : settings.using_live_keys}
                           </Label>
                        </div>
                     </div>
                  </div>

                  {/* Test Credentials */}
                  <div
                     className={cn('border-b pb-6', {
                        'opacity-60': !data.test_mode,
                     })}
                  >
                     <h3 className="mb-4 text-lg font-medium">
                        {settings.test_credentials}
                     </h3>
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                        <div>
                           <Label>Test Server Key</Label>
                           <Input
                              name="test_server_key"
                              defaultValue={
                                 payment.fields.test_server_key ?? ''
                              }
                              placeholder="SB-Mid-server-xxxxxxxxxxxxxxxx"
                              disabled={!data.test_mode}
                              type="password"
                           />
                           <InputError message={errors.test_server_key} />
                        </div>
                        <div>
                           <Label>Test Client Key</Label>
                           <Input
                              name="test_client_key"
                              defaultValue={
                                 payment.fields.test_client_key ?? ''
                              }
                              placeholder="SB-Mid-client-xxxxxxxxxxxxxxxx"
                              disabled={!data.test_mode}
                           />
                           <InputError message={errors.test_client_key} />
                        </div>
                     </div>
                  </div>

                  {/* Live Credentials */}
                  <div
                     className={cn('space-y-6', {
                        'opacity-60': data.test_mode,
                     })}
                  >
                     <h3 className="mb-4 text-lg font-medium">
                        {settings.live_credentials}
                     </h3>
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                        <div>
                           <Label>Live Server Key</Label>
                           <Input
                              name="live_server_key"
                              defaultValue={
                                 payment.fields.live_server_key ?? ''
                              }
                              placeholder="Mid-server-xxxxxxxxxxxxxxxx"
                              disabled={data.test_mode}
                              type="password"
                           />
                           <InputError message={errors.live_server_key} />
                        </div>
                        <div>
                           <Label>Live Client Key</Label>
                           <Input
                              name="live_client_key"
                              defaultValue={
                                 payment.fields.live_client_key ?? ''
                              }
                              placeholder="Mid-client-xxxxxxxxxxxxxxxx"
                              disabled={data.test_mode}
                           />
                           <InputError message={errors.live_client_key} />
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <LoadingButton type="submit" loading={processing}>
                        {button.save_changes}
                     </LoadingButton>
                  </div>
               </>
            );
         }}
      </Form>
   );
};

export default Midtrans;
