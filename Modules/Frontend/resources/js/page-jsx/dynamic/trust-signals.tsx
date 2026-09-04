import { Banknote, ShieldCheck, Wrench, Zap } from 'lucide-react';

const DEFAULT_FIELDS = {
   heading: 'Kenapa Memilih Kami?',
   subheading:
      'Dipercaya oleh ribuan pengguna Apple di seluruh Indonesia untuk solusi keamanan dan perangkat keras premium.',
   feature_1_title: 'Cepat',
   feature_1_description:
      'Estimasi pengerjaan 1-3 hari kerja untuk mayoritas layanan.',
   feature_2_title: 'Garansi',
   feature_2_description: 'Garansi seumur hidup untuk layanan unlock permanen.',
   feature_3_title: 'Teknisi Ahli',
   feature_3_description:
      'Lebih dari 8 tahun pengalaman menangani ekosistem Apple.',
   feature_4_title: 'Transparan',
   feature_4_description:
      'Harga pasti di awal, tanpa biaya tersembunyi setelah pengerjaan.',
   avatar_1_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANjDZS05kvX8PkR2S0J1XeQhOTibTqJc6YKxVxoDJOmds73PIqGJYu1T5dPYaCBKukl6ajvgpjg5tRwUtWmPAzL3aK2fhwxdYI7A4CzTW9XejhA7GjrAAGG18NYR_vFUVQ5hBU6JqyqZMUHik6wOPo9ndUZfayw36B5fCfWyijYQdJx_5pod6xMqs1lh9WpLjo88zs5NBrOXWYa_qdTTNhxj_fvfW5AIJr6e7NR6QuChhzEVkSpHvBcg',
   avatar_2_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUYZ05-inEsrXmtwc79LJrzVbJcbFdnimOBRcANYwKvCeJ3-_6jepB8in0GpnN1NPdmxzcBePcefYX_dBiMqMYlTRZcQzh-w7_fmk7aJtBBv4NZMVWHhCPl9mKetHe8CwfqucSc_nFktvCj-SFWbXSPHorxr4wlrn9OqHmNkgxdSlp5naksZN8KKN8_LhCV8BYYqG2SfNVU15YHCUKv7rWP-8NbdXll_KQN10V4c_0GsrLG5VZ9YbP8Q',
   avatar_3_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCU4GRCQqw4VtffK3mO68t2FvNZ5XLISpRrGhhApfWb4NoCwwxyd5c9U4-Iqj_YLs6BQUIjKOp4XAa3JUeiNgNmqTJGLZ0kVIV_0zF8yIVMrNieKAxisdJv0dq37d4sI6Gwvd1GhNrX6TylDyvqpuB1ed_BVNmFBwf8canc4zO6FLR3JRWUlqMbjTJoJGgsOKA7de4h7s4MbKvjxcdE-n8tTRy9vig9-kfpz-FmMJ6DChUBmXPdZfGOw',
   avatars_badge: '+5k',
   banner_text: '5000+ iPhone Berhasil Di-unlock',
} as const;

type FieldKey = keyof typeof DEFAULT_FIELDS;

interface Props {
   fields?: Record<string, string>;
}

const TrustSignals = ({ fields }: Props) => {
   const f = (key: FieldKey): string =>
      fields?.[key]?.trim() || DEFAULT_FIELDS[key];

   const features = [
      {
         icon: Zap,
         title: f('feature_1_title'),
         description: f('feature_1_description'),
      },
      {
         icon: ShieldCheck,
         title: f('feature_2_title'),
         description: f('feature_2_description'),
      },
      {
         icon: Wrench,
         title: f('feature_3_title'),
         description: f('feature_3_description'),
      },
      {
         icon: Banknote,
         title: f('feature_4_title'),
         description: f('feature_4_description'),
      },
   ];

   const avatars = [f('avatar_1_url'), f('avatar_2_url'), f('avatar_3_url')];

   return (
      <section className="bg-background py-16 md:py-24" id="kenapa-kami">
         <div className="mx-auto w-full max-w-[1280px] px-6">
            <div className="mb-16 text-center">
               <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  {f('heading')}
               </h2>
               <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {f('subheading')}
               </p>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
               {features.map((feature) => (
                  <div
                     key={feature.title}
                     className="flex flex-col items-center rounded-xl bg-muted/50 p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1"
                  >
                     <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background text-blue-600 shadow-sm">
                        <feature.icon className="h-8 w-8" />
                     </div>
                     <h3 className="mb-3 text-xl font-semibold text-primary">
                        {feature.title}
                     </h3>
                     <p className="text-sm text-muted-foreground md:text-base">
                        {feature.description}
                     </p>
                  </div>
               ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-blue-600/10 bg-blue-600/5 p-6 text-center">
               <div className="flex -space-x-3">
                  {avatars.map((src) => (
                     <img
                        key={src}
                        alt=""
                        src={src}
                        className="h-10 w-10 rounded-full border-2 border-background object-cover"
                     />
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                     {f('avatars_badge')}
                  </div>
               </div>
               <span className="text-xl font-semibold text-primary">
                  {f('banner_text')}
               </span>
            </div>
         </div>
      </section>
   );
};

export default TrustSignals;
