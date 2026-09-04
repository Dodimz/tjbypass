import BlogCard1 from '@/components/cards/blog-card-1';
import Breadcrumbs from '@/components/breadcrumbs';
import { Renderer } from '@/components/rich-editor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LandingLayout from '@/layouts/landing';
import blogs from '@/routes/blogs';
import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import BlogComments from './partials/blog-comments';
import BlogLikeDislike from './partials/blog-like-dislike';

const ShowBlog = ({ blog, relatedBlogs }: BlogShowProps) => {
   const { url, props } = usePage<BlogShowProps>();
   const { translate, system } = props;
   const { frontend } = translate;
   const {
      title,
      description,
      created_at,
      updated_at,
      user,
      category,
      banner,
      thumbnail,
   } = blog;

   const createdAt = new Date(created_at);
   const updatedAt = new Date(updated_at);
   const authorInitials = user?.name
      ? user.name
           .split(' ')
           .map((n) => n.charAt(0))
           .join('')
           .toUpperCase()
      : frontend.author_initials_fallback;

   const keywords = (blog.keywords || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

   // Meta information
   const siteName = system?.fields?.name || frontend.default_site_name;
   const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
   const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
   const pageTitle = `${title} | ${siteName}`;
   const plainText =
      description
         ?.replace(/<[^>]*>/g, ' ')
         .replace(/\s+/g, ' ')
         .trim() || '';
   const pageDescription =
      plainText.length > 160 ? `${plainText.slice(0, 157)}...` : plainText;
   const ogImage = banner || thumbnail || system?.fields?.banner || '';

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            {pageDescription && (
               <meta name="description" content={pageDescription} />
            )}
            {keywords.length > 0 && (
               <meta name="keywords" content={keywords.join(', ')} />
            )}
            <meta name="author" content={user?.name || siteName} />

            {/* Canonical URL */}
            {siteUrl && <link rel="canonical" href={siteUrl} />}

            {/* Open Graph Tags */}
            <meta property="og:type" content="article" />
            {siteUrl && <meta property="og:url" content={siteUrl} />}
            <meta property="og:title" content={title} />
            {pageDescription && (
               <meta property="og:description" content={pageDescription} />
            )}
            <meta property="og:site_name" content={siteName} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {ogImage && <meta property="og:image:width" content="1200" />}
            {ogImage && <meta property="og:image:height" content="630" />}
            {ogImage && (
               <meta property="og:image:alt" content={title} />
            )}

            {/* Article-specific OG */}
            <meta property="og:article:published_time" content={created_at} />
            <meta property="og:article:modified_time" content={updated_at} />
            {user?.name && (
               <meta property="og:article:author" content={user.name} />
            )}
            {category?.name && (
               <meta property="og:article:section" content={category.name} />
            )}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {pageDescription && (
               <meta name="twitter:description" content={pageDescription} />
            )}
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Schema.org structured data */}
            <script type="application/ld+json">
               {JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BlogPosting',
                  headline: title,
                  description: pageDescription,
                  image: ogImage,
                  url: siteUrl,
                  mainEntityOfPage: siteUrl,
                  datePublished: created_at,
                  dateModified: updated_at,
                  author: user?.name
                     ? {
                          '@type': 'Person',
                          name: user.name,
                       }
                     : undefined,
                  publisher: {
                     '@type': 'Organization',
                     name: siteName,
                     url: siteOrigin,
                     ...(system?.fields?.logo_light
                        ? {
                             logo: {
                                '@type': 'ImageObject',
                                url: system.fields.logo_light,
                             },
                          }
                        : {}),
                  },
                  keywords: keywords.join(', '),
               })}
            </script>

            {/* BreadcrumbList structured data */}
            {siteUrl && (
               <script type="application/ld+json">
                  {JSON.stringify({
                     '@context': 'https://schema.org',
                     '@type': 'BreadcrumbList',
                     itemListElement: [
                        {
                           '@type': 'ListItem',
                           position: 1,
                            name: 'Home',
                           item: siteOrigin,
                        },
                        {
                           '@type': 'ListItem',
                           position: 2,
                            name: frontend.all_blogs,
                           item: `${siteOrigin}/blogs/all`,
                        },
                        ...(category?.name
                           ? [
                                {
                                   '@type': 'ListItem',
                                   position: 3,
                                   name: category.name,
                                   item: `${siteOrigin}/blogs/${category.slug}`,
                                },
                                {
                                   '@type': 'ListItem',
                                   position: 4,
                                   name: title,
                                },
                             ]
                           : [
                                {
                                   '@type': 'ListItem',
                                   position: 3,
                                   name: title,
                                },
                             ]),
                     ],
                  })}
               </script>
            )}
         </Head>

         <div className="mx-auto w-full max-w-4xl space-y-6">
            {/* Banner */}
            {banner && (
               <div className="overflow-hidden border">
                  <img
                     src={banner}
                     alt={frontend.blog_banner_alt}
                     className="max-h-64 w-full object-cover sm:max-h-80 md:max-h-[420px]"
                  />
               </div>
            )}

            <article>
               {/* Breadcrumbs */}
               <div className="px-4 pt-4">
                  <Breadcrumbs
                     title=""
                     breadcrumbs={[
                        { title: 'Home', href: '/' },
                        {
                           title: frontend.all_blogs,
                           href: blogs.visit.url('all'),
                        },
                        ...(category?.name
                           ? [
                                {
                                   title: category.name,
                                   href: blogs.visit.url(category.slug),
                                },
                             ]
                           : []),
                        { title },
                     ]}
                  />
               </div>

               {/* Title and meta */}
               <div className="space-y-3 px-4">
                  <div className="flex flex-wrap items-center gap-3">
                     {category?.name && (
                        <Link href={blogs.visit.url(category.slug)}>
                           <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
                              {category.name}
                           </Badge>
                        </Link>
                     )}
                     {keywords.slice(0, 3).map((k) => (
                        <Badge key={k} variant="outline">
                           {k}
                        </Badge>
                     ))}
                  </div>
                  <h1 className="text-2xl leading-tight font-semibold md:text-3xl">
                     {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                           <AvatarImage
                              src={user?.photo || undefined}
                              alt={user?.name || frontend.author_alt}
                           />
                           <AvatarFallback>{authorInitials}</AvatarFallback>
                        </Avatar>
                        <span>{user?.name}</span>
                     </div>
                     <span>•</span>
                     <time dateTime={created_at}>
                        {createdAt.toLocaleDateString()}
                     </time>
                     {updatedAt > createdAt && (
                        <>
                           <span>•</span>
                           <time dateTime={updated_at}>
                              {frontend.last_updated}{' '}
                              {updatedAt.toLocaleDateString()}
                           </time>
                        </>
                     )}
                  </div>
               </div>

               <Separator />

               <div className="space-y-6 px-6 pb-10">
                  {/* Content */}
                  <section>
                     {thumbnail && (
                        <img
                           src={thumbnail}
                           alt={frontend.blog_thumbnail_alt}
                           className="max-h-60 w-full overflow-hidden rounded-lg border object-cover sm:max-h-72 md:max-h-96"
                        />
                     )}

                     <div className="prose dark:prose-invert max-w-none py-6">
                        <Renderer value={description ?? ''} />
                     </div>
                  </section>

                  {/* Keywords */}
                  {keywords.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {keywords.map((k) => (
                           <Badge key={k} variant="secondary">
                              #{k}
                           </Badge>
                        ))}
                     </div>
                  )}

                  <Separator className="my-6" />

                  {/* Like/Dislike Section */}
                  <section className="flex items-center justify-center py-4">
                     <BlogLikeDislike />
                  </section>

                  <Separator className="my-6" />

                  {/* Comments Section */}
                  <section>
                     <BlogComments />
                  </section>
               </div>
            </article>

            {/* Related Posts */}
            {relatedBlogs && relatedBlogs.length > 0 && (
               <section className="space-y-4 px-6 pb-10">
                  <h2 className="text-xl font-semibold md:text-2xl">
                     {frontend.latest_blog_posts}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {relatedBlogs.map((relatedBlog) => (
                        <BlogCard1 key={relatedBlog.id} blog={relatedBlog} />
                     ))}
                  </div>
               </section>
            )}
         </div>
      </>
   );
};

ShowBlog.layout = (page: ReactNode) => <LandingLayout children={page} />;

export default ShowBlog;
