import { Clock, LockOpen, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Fragment } from 'react';

const DEFAULT_FIELDS = {
   title: 'Siap Unlock iPhone Anda Sekarang?',
   subtitle:
      'Hubungi kami sekarang dan dapatkan konsultasi GRATIS! Jangan biarkan perangkat premium Anda menjadi barang rongsokan.',
   whatsapp_label: 'WhatsApp Kami',
   whatsapp_url: 'https://wa.me/6281234567890',
   phone_label: 'Telepon Sekarang',
   phone_number: '+62211234567',
   address_title: 'Workshop Area',
   address_lines: 'Gedung ITC Kuningan Lt. 3\nJakarta Selatan, 12940',
   hours_title: 'Jam Operasional',
   hours_lines:
      'Senin - Sabtu: 10:00 - 20:00 WIB\nMinggu: Libur (Online Support Only)',
} as const;

type FieldKey = keyof typeof DEFAULT_FIELDS;

interface Props {
   fields?: Record<string, string>;
}

const Multiline = ({ text }: { text: string }) => (
   <>
      {text.split('\n').map((line, i, arr) => (
         <Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
         </Fragment>
      ))}
   </>
);

const FinalCtaBanner = ({ fields }: Props) => {
   const f = (key: FieldKey): string =>
      fields?.[key]?.trim() || DEFAULT_FIELDS[key];

   return (
      <section className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-primary px-6 py-16 md:py-24">
         <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
               backgroundImage:
                  'radial-gradient(circle at top right, #007AFF 0%, transparent 50%), radial-gradient(circle at bottom left, #25D366 0%, transparent 50%)',
            }}
         />

         <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center text-center">
            <LockOpen className="mb-6 h-16 w-16 text-blue-500" />

            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-primary-foreground uppercase md:text-[56px] md:leading-tight">
               {f('title')}
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/70">
               {f('subtitle')}
            </p>

            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
               <a
                  href={f('whatsapp_url')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 font-semibold text-white shadow-[0_8px_20px_rgba(37,211,102,0.3)] transition-all hover:-translate-y-1 hover:bg-[#25D366]/90 sm:w-auto"
               >
                  <MessageCircle className="h-5 w-5" />
                  {f('whatsapp_label')}
               </a>
               <a
                  href={`tel:${f('phone_number')}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-white/10 sm:w-auto"
               >
                  <Phone className="h-5 w-5" />
                  {f('phone_label')}
               </a>
            </div>

            <div className="grid grid-cols-1 gap-8 rounded-2xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-md sm:grid-cols-2">
               <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                     <p className="mb-1 font-semibold text-white">
                        {f('address_title')}
                     </p>
                     <p className="text-sm text-white/70">
                        <Multiline text={f('address_lines')} />
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <Clock className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                     <p className="mb-1 font-semibold text-white">
                        {f('hours_title')}
                     </p>
                     <p className="text-sm text-white/70">
                        <Multiline text={f('hours_lines')} />
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default FinalCtaBanner;
