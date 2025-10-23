import { Effect } from 'effect'

import { PostsService, RuntimeServer } from '@workspace/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

const main = Effect.gen(function* () {
  const postsService = yield* PostsService
  const allPosts = yield* postsService.getAllPosts
  return allPosts
})

export default async function PostsPage() {
  const result = await RuntimeServer.runPromise(
    main.pipe(
      Effect.match({
        onFailure: error => {
          console.error('Failed to load posts:', error)
          return { success: false as const, error: 'Failed to load posts' }
        },
        onSuccess: postList => ({ success: true as const, data: postList }),
      })
    )
  )

  if (!result.success) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-24'>
        <p className='text-destructive'>Error: {result.error}</p>
      </main>
    )
  }

  const posts = result.data

  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='z-10 w-full max-w-5xl'>
        <h1 className='mb-8 font-bold text-4xl'>Posts</h1>
        
        <div className='grid gap-4'>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {post.published ? 'Published' : 'Draft'} • {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              {post.content && (
                <CardContent>
                  <p className='text-muted-foreground'>{post.content}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No posts found</CardTitle>
              <CardDescription>
                There are no posts in the database yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  )
}

