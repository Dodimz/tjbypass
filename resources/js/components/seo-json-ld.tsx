import { usePage } from '@inertiajs/react';

interface SeoJsonLdProps {
   type?: 'home' | 'article' | 'course';
   title?: string;
   description?: string;
   image?: string;
   url?: string;
}

const SeoJsonLd = ({
   type = 'home',
   title,
   description,
   image,
   url,
}: SeoJsonLdProps) => {
   const { props } = usePage<SharedData>();
   const { system } = props;

   const siteName = system?.fields?.name || 'Mentor Learning Management System';
   const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
   const siteDescription = description || system?.fields?.description || '';
   const siteImage = image || system?.fields?.banner || '';
   const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

   const schemas: Record<string, unknown>[] = [];

   // Organization schema (always included)
   schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      ...(siteImage
         ? {
              logo: {
                 '@type': 'ImageObject',
                 url: siteImage,
              },
           }
         : {}),
      ...(system?.fields?.social_media
         ? {
              sameAs: Object.values(system.fields.social_media).filter(Boolean),
           }
         : {}),
   });

   // WebSite schema with SearchAction
   schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      potentialAction: {
         '@type': 'SearchAction',
         target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/courses/all?course_search={search_term_string}`,
         },
         'query-input': 'required name=search_term_string',
      },
   });

   // Page-specific schema
   if (type === 'home') {
      schemas.push({
         '@context': 'https://schema.org',
         '@type': 'WebPage',
         name: title || siteName,
         description: siteDescription,
         url: pageUrl,
         ...(siteImage ? { image: siteImage } : {}),
      });
   }

   return (
      <>
         {schemas.map((schema, index) => (
            <script
               key={`seo-jsonld-${index}`}
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
         ))}
      </>
   );
};

export default SeoJsonLd;
