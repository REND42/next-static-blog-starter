import { allPosts } from 'contentlayer/generated'
import { format, parseISO } from 'date-fns'
import { FiChevronLeft } from 'react-icons/fi'
import Link from 'next/link'
import TableOfContent from '@/components/table-of-content'
import { getTableOfContents } from '@/lib/toc'
import { Mdx } from '@/components/mdx'
import GiscusComment from '@/components/giscus-comment'
import { siteConfig } from '@/config/site'
import { env } from 'process'
import { absoluteUrl } from '@/lib/utils'
import { Balancer } from 'react-wrap-balancer'

const BackTo = () => {
  return (
    <Link
      href="/blog/page/1"
      className="no-underline mb-4 inline-flex items-center justify-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-500">
      <FiChevronLeft className="mr-2 h-4 w-4" />
      See all posts
    </Link>
  )
}

interface PageProps {
  params: {
    slug: string
  }
}

async function getPageFromParams(params: any) {
  const slug = params?.slug
  const page = allPosts.find((page) => page.slugAsParams === slug)

  if (!page) {
    null
  }

  return page
}

export async function generateMetadata({ params }: PageProps) {
  const page = await getPageFromParams(params)
  if (!page) {
    return {}
  }

  const url = env.NEXT_PUBLIC_APP_URL
  const ogUrl = new URL(`${url}/api/og`)
  ogUrl.searchParams.set('title', page.title)
  ogUrl.searchParams.set('author', siteConfig.name)
  ogUrl.searchParams.set('mode', 'light')
  ogUrl.searchParams.set('cover', page.cover)

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
      url: absoluteUrl(page.slug),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: page.title
        }
      ],
      creator: '42arch'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [ogUrl.toString()],
      creator: '42arch'
    }
  }
}

export async function generateStaticParams(): Promise<PageProps['params'][]> {
  return allPosts.map((post) => ({
    slug: post.slug
  }))
}

export default async function Page({ params }: PageProps) {
  const slug = params?.slug
  const post = allPosts.find((post) => {
    return post.slug === `blog/${slug}`
  })

  if (!post) {
    return <div>not found</div>
  }
  const toc = await getTableOfContents(post.body.raw)

  return (
    <article className="relative py-2 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-4 xl:gap-20">
      <div className="">
        <header className="pt-6">
          <div className="space-y-4">
            <div className="space-y-20">
              <time
                dateTime={post.date}
                className="text-sm text-slate-600 dark:text-slate-400">
                Published on {format(parseISO(post.date), 'LLLL d, yyyy')}
              </time>
            </div>
            <h2 className="inline-block w-full text-center mt-8 text-4xl font-extrabold text-slate-900 dark:text-slate-100 lg:text-5xl">
              <Balancer ratio={0.8} className="text-center leading-snug">
                {post.title}
              </Balancer>
            </h2>
          </div>
          <hr className="my-4 lg:my-8 border-slate-200 dark:border-slate-700" />
        </header>
        <div className=" max-w-none py-4">
          <Mdx code={post.body.code} />
          <hr className="my-4 lg:my-8 border-slate-200 dark:border-slate-700" />
          <div className="lg:hidden flex justify-center py-6 lg:py-10">
            <BackTo />
          </div>
        </div>
        <GiscusComment />
      </div>
      <div className="hidden text-sm lg:block">
        <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
          <TableOfContent toc={toc} />
          <div className="mt-10">
            <BackTo />
          </div>
        </div>
      </div>
    </article>
  )
}
