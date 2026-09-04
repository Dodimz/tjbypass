import {
   EditorContainer,
   EditorDiv,
   EditorDynamicWrapper,
   EditorHeading,
   EditorParagraph,
   EditorSection,
} from '@/frontend/lib/components';

const Services = () => {
   return (
      <EditorSection className="overflow-hidden bg-[url('/assets/images/intro/home-1/bg-line.png')] bg-cover bg-center py-20">
         <EditorContainer className="relative">
            <EditorDiv className="relative z-10">
               <EditorDiv className="mx-auto mb-10 text-center md:max-w-xl">
                  <EditorParagraph className="mb-1 font-medium text-secondary-foreground">
                     Services
                  </EditorParagraph>
                  <EditorHeading className="mb-4 text-3xl font-bold sm:text-4xl">
                     Digital Services
                  </EditorHeading>
                  <EditorParagraph className="text-muted-foreground">
                     Get professional services delivered by experts — from
                     design and development to marketing and beyond.
                  </EditorParagraph>
               </EditorDiv>

               <EditorDynamicWrapper
                  api="api/collections/services/new"
                  apiMethod="GET"
                  componentRef="services-carousel-1"
               />
            </EditorDiv>

            <EditorDiv className="pointer-events-none absolute -top-40 -right-60 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(97,95,255,0.45)_0%,transparent_70%)] opacity-50 content-['']"></EditorDiv>
            <EditorDiv className="pointer-events-none absolute -bottom-60 -left-60 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,120,103,0.45)_0%,transparent_70%)] opacity-50 content-['']"></EditorDiv>
         </EditorContainer>
      </EditorSection>
   );
};

export default Services;
