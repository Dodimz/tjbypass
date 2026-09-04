import BlogCard1 from '@/components/cards/blog-card-1';
import Breadcrumbs from '@/components/breadcrumbs';
import TableFooter from '@/components/table/table-footer';
import LandingLayout from '@/layouts/landing';
import blogs from '@/routes/blogs';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Layout from './partials/layout';

const Index = (props: BlogsIndexProps) => {
   const { url } = usePage();
   const { blogs: blogsData, category, system, translate } = props;
   const { frontend } = translate;

   // Generate meta information based on category
   const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
   const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
   const siteName = system?.fields?.name || frontend.default_site_name;
   const siteAuthor = system?.fields?.author || frontend.default_author;
   const totalBlogs = blogsData?.total || 0;

   const pageTitle = category
      ? `${category.name} ${frontend.all_blogs} | ${siteName}`
      : `${frontend.all_blogs} | ${siteName}`;
   const pageDescription = category
      ? `${totalBlogs > 0 ? `Browse ${totalBlogs}+` : 'Browse'} ${category.name.toLowerCase()} blog posts from our expert authors. Stay up to date with the latest insights and articles.`
      : frontend.blog_page_description.replace(':total', totalBlogs.toString());
   const pageKeywords = category
      ? `${category.name.toLowerCase()}, blog, articles, ${system?.fields?.keywords || 'LMS'}`
      : frontend.blog_page_keywords;
   const ogTitle = category
      ? `${category.name} ${frontend.all_blogs}`
      : frontend.latest_blog_posts;

   const firstBlogImage =
      blogsData?.data?.[0]?.thumbnail || blogsData?.data?.[0]?.banner || '';
   const ogImage = firstBlogImage || system?.fields?.banner || '';

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />
            <meta name="author" content={siteAuthor} />

            {/* Canonical URL */}
            {siteUrl && <link rel="canonical" href={siteUrl} />}

            {/* Open Graph Tags */}
            <meta property="og:type" content="website" />
            {siteUrl && <meta property="og:url" content={siteUrl} />}
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:site_name" content={siteName} />

            {/* Open Graph Image */}
            {ogImage && <meta property="og:image" content={ogImage} />}
            {ogImage && <meta property="og:image:width" content="1200" />}
            {ogImage && <meta property="og:image:height" content="630" />}
            {ogImage && (
               <meta
                  property="og:image:alt"
                  content={`${pageTitle} - ${frontend.blog_list_alt}`}
               />
            )}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle} />
            <meta name="twitter:description" content={pageDescription} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Schema.org structured data */}
            <script type="application/ld+json">
               {JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'CollectionPage',
                  name: pageTitle,
                  description: pageDescription,
                  url: siteUrl,
                  image: ogImage,
                  provider: {
                     '@type': 'Organization',
                     name: siteName,
                     url: siteOrigin,
                  },
                  mainEntity: {
                     '@type': 'ItemList',
                     name: `${pageTitle} Collection`,
                     description: pageDescription,
                     numberOfItems: totalBlogs,
                     itemListElement:
                        blogsData?.data
                           ?.slice(0, 10)
                           .map((blog: Blog, index: number) => ({
                              '@type': 'BlogPosting',
                              position: index + 1,
                              name: blog.title,
                              headline: blog.title,
                              description: (blog.description || '')
                                 .replace(/<[^>]*>/g, ' ')
                                 .replace(/\s+/g, ' ')
                                 .trim()
                                 .slice(0, 160),
                              image: blog.thumbnail || blog.banner || '',
                              url: siteOrigin
                                 ? `${siteOrigin}/blog/${blog.slug}`
                                 : undefined,
                              provider: {
                                 '@type': 'Organization',
                                 name: siteName,
                              },
                           }))
                           .filter(Boolean) || [],
                  },
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
                        ...(category
                           ? [
                                {
                                   '@type': 'ListItem',
                                   position: 2,
                                   name: frontend.all_blogs || 'Blog',
                                   item: `${siteOrigin}/blogs/all`,
                                },
                                {
                                   '@type': 'ListItem',
                                   position: 3,
                                   name: category.name,
                                },
                             ]
                           : [
                                {
                                   '@type': 'ListItem',
                                   position: 2,
                                   name: frontend.all_blogs || 'All Blogs',
                                },
                             ]),
                     ],
                  })}
               </script>
            )}

            {/* rel=next/prev for pagination */}
            {blogsData?.current_page > 1 && (
               <link
                  rel="prev"
                  href={`${siteOrigin}${url.split('?')[0]}?${new URLSearchParams({
                     ...Object.fromEntries(new URLSearchParams(url.split('?')[1] || '')),
                     blogs_page: String(blogsData.current_page - 1),
                  }).toString()}`}
               />
            )}
            {blogsData?.current_page < (blogsData?.last_page || 1) && (
               <link
                  rel="next"
                  href={`${siteOrigin}${url.split('?')[0]}?${new URLSearchParams({
                     ...Object.fromEntries(new URLSearchParams(url.split('?')[1] || '')),
                     blogs_page: String(blogsData.current_page + 1),
                  }).toString()}`}
               />
            )}
         </Head>

         <Breadcrumbs
            title={
               category
                  ? `${category.name} ${frontend.all_blogs}`
                  : frontend.all_blogs
            }
            breadcrumbs={[
               { title: 'Home', href: '/' },
               ...(category
                  ? [
                       {
                          title: frontend.all_blogs,
                          href: blogs.visit.url('all'),
                       },
                       { title: category.name },
                    ]
                  : [{ title: frontend.all_blogs }]),
            ]}
         />

         <div
            className={cn(
               'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
            )}
         >
            {blogsData.data.map((blog: Blog) => (
               <BlogCard1 key={blog.id} blog={blog} />
            ))}
         </div>

         <TableFooter
            className="mt-6 p-5 sm:p-7"
            routeName="blogs.visit"
            paginationInfo={blogsData}
            paginationKey="blogs"
            routeParams={{ category: category ? category.slug : 'all' }}
         />
      </>
   );
};

Index.layout = (page: ReactNode) => (
   <LandingLayout>
      <Layout>{page}</Layout>
   </LandingLayout>
);

export default Index;
