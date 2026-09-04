import {
   EditorButton,
   EditorDiv,
   EditorHeading,
   EditorLink,
   EditorParagraph,
   EditorSection,
   EditorSpan,
} from '@/frontend/lib/components';

const FinalCtaBanner = () => {
   return (
      <EditorSection className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-primary px-6 py-16 md:py-24">
         <EditorDiv className="pointer-events-none absolute inset-0 opacity-20" />

         <EditorDiv className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center text-center">
            <EditorSpan className="mb-6 text-6xl text-blue-500">
               &#128275;
            </EditorSpan>

            <EditorHeading className="mb-6 text-4xl font-extrabold tracking-tight text-primary-foreground uppercase md:text-[56px] md:leading-tight">
               Siap Unlock iPhone Anda Sekarang?
            </EditorHeading>

            <EditorParagraph className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/70">
               Hubungi kami sekarang dan dapatkan konsultasi GRATIS! Jangan
               biarkan perangkat premium Anda menjadi barang rongsokan.
            </EditorParagraph>

            <EditorDiv className="mb-12 flex flex-col gap-4 sm:flex-row">
               <EditorLink href="https://wa.me/6281234567890">
                  <EditorButton className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 font-semibold text-white shadow-[0_8px_20px_rgba(37,211,102,0.3)] transition-all hover:-translate-y-1 hover:bg-[#25D366]/90 sm:w-auto">
                     WhatsApp Kami
                  </EditorButton>
               </EditorLink>
               <EditorLink href="tel:+62211234567">
                  <EditorButton className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-white/10 sm:w-auto">
                     Telepon Sekarang
                  </EditorButton>
               </EditorLink>
            </EditorDiv>

            <EditorDiv className="grid grid-cols-1 gap-8 rounded-2xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-md sm:grid-cols-2">
               <EditorDiv className="flex items-start gap-4">
                  <EditorSpan className="mt-1 text-xl text-blue-500">
                     &#128205;
                  </EditorSpan>
                  <EditorDiv>
                     <EditorParagraph className="mb-1 font-semibold text-white">
                        Workshop Area
                     </EditorParagraph>
                     <EditorParagraph className="text-sm text-white/70">
                        Gedung ITC Kuningan Lt. 3 Jakarta Selatan, 12940
                     </EditorParagraph>
                  </EditorDiv>
               </EditorDiv>

               <EditorDiv className="flex items-start gap-4">
                  <EditorSpan className="mt-1 text-xl text-blue-500">
                     &#128336;
                  </EditorSpan>
                  <EditorDiv>
                     <EditorParagraph className="mb-1 font-semibold text-white">
                        Jam Operasional
                     </EditorParagraph>
                     <EditorParagraph className="text-sm text-white/70">
                        Senin - Sabtu: 10:00 - 20:00 WIB Minggu: Libur (Online
                        Support Only)
                     </EditorParagraph>
                  </EditorDiv>
               </EditorDiv>
            </EditorDiv>
         </EditorDiv>
      </EditorSection>
   );
};

export default FinalCtaBanner;
