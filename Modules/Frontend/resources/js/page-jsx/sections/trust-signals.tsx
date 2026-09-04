import {
   EditorDiv,
   EditorHeading,
   EditorImage,
   EditorParagraph,
   EditorSection,
   EditorSpan,
} from '@/frontend/lib/components';

const TrustSignals = () => {
   return (
      <EditorSection className="bg-background py-16 md:py-24">
         <EditorDiv className="mx-auto w-full max-w-[1280px] px-6">
            <EditorDiv className="mb-16 text-center">
               <EditorHeading className="mb-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
                  Kenapa Memilih Kami?
               </EditorHeading>
               <EditorParagraph className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Dipercaya oleh ribuan pengguna Apple di seluruh Indonesia
                  untuk solusi keamanan dan perangkat keras premium.
               </EditorParagraph>
            </EditorDiv>

            <EditorDiv className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
               <EditorDiv className="flex flex-col items-center rounded-xl bg-muted/50 p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <EditorDiv className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background text-blue-600 shadow-sm">
                     <EditorSpan className="text-2xl">&#9889;</EditorSpan>
                  </EditorDiv>
                  <EditorHeading className="mb-3 text-xl font-semibold text-primary">
                     Cepat
                  </EditorHeading>
                  <EditorParagraph className="text-sm text-muted-foreground md:text-base">
                     Estimasi pengerjaan 1-3 hari kerja untuk mayoritas layanan.
                  </EditorParagraph>
               </EditorDiv>

               <EditorDiv className="flex flex-col items-center rounded-xl bg-muted/50 p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <EditorDiv className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background text-blue-600 shadow-sm">
                     <EditorSpan className="text-2xl">&#10004;</EditorSpan>
                  </EditorDiv>
                  <EditorHeading className="mb-3 text-xl font-semibold text-primary">
                     Garansi
                  </EditorHeading>
                  <EditorParagraph className="text-sm text-muted-foreground md:text-base">
                     Garansi seumur hidup untuk layanan unlock permanen.
                  </EditorParagraph>
               </EditorDiv>

               <EditorDiv className="flex flex-col items-center rounded-xl bg-muted/50 p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <EditorDiv className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background text-blue-600 shadow-sm">
                     <EditorSpan className="text-2xl">&#128736;</EditorSpan>
                  </EditorDiv>
                  <EditorHeading className="mb-3 text-xl font-semibold text-primary">
                     Teknisi Ahli
                  </EditorHeading>
                  <EditorParagraph className="text-sm text-muted-foreground md:text-base">
                     Lebih dari 8 tahun pengalaman menangani ekosistem Apple.
                  </EditorParagraph>
               </EditorDiv>

               <EditorDiv className="flex flex-col items-center rounded-xl bg-muted/50 p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <EditorDiv className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background text-blue-600 shadow-sm">
                     <EditorSpan className="text-2xl">&#128176;</EditorSpan>
                  </EditorDiv>
                  <EditorHeading className="mb-3 text-xl font-semibold text-primary">
                     Transparan
                  </EditorHeading>
                  <EditorParagraph className="text-sm text-muted-foreground md:text-base">
                     Harga pasti di awal, tanpa biaya tersembunyi setelah
                     pengerjaan.
                  </EditorParagraph>
               </EditorDiv>
            </EditorDiv>

            <EditorDiv className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-blue-600/10 bg-blue-600/5 p-6 text-center">
               <EditorDiv className="flex -space-x-3">
                  <EditorImage
                     src="/assets/avatars/avatar-1.png"
                     alt="Avatar 1"
                     className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                  <EditorImage
                     src="/assets/avatars/avatar-2.png"
                     alt="Avatar 2"
                     className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                  <EditorImage
                     src="/assets/avatars/avatar-3.png"
                     alt="Avatar 3"
                     className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  />
                  <EditorDiv className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                     +5k
                  </EditorDiv>
               </EditorDiv>
               <EditorSpan className="text-xl font-semibold text-primary">
                  5000+ iPhone Berhasil Di-unlock
               </EditorSpan>
            </EditorDiv>
         </EditorDiv>
      </EditorSection>
   );
};

export default TrustSignals;
