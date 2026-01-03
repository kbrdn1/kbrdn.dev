<script setup lang="ts">
const { data: blogPage } = await useAsyncData('blog-page', () =>
  queryCollection('pages').path('/blog').first()
)

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').all()
)

useSeoMeta({
  title: blogPage.value?.title || 'Blog',
  description: blogPage.value?.description || 'Articles et réflexions'
})
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <!-- Page Content -->
    <ContentRenderer v-if="blogPage" :value="blogPage" class="prose prose-invert max-w-4xl mx-auto mb-12" />

    <!-- Blog Posts Grid -->
    <div v-if="posts && posts.length > 0" class="max-w-6xl mx-auto mt-12">
      <h2 class="text-2xl font-bold mb-6 text-neutral-100">Tous les articles</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="post in posts"
          :key="post._id"
          :to="`/blog/${post._path?.split('/').pop()}`"
          class="hover:bg-neutral-900 transition-colors"
        >
          <template #header>
            <h3 class="text-xl font-semibold text-neutral-100">{{ post.title }}</h3>
          </template>

          <p class="text-neutral-400">{{ post.description }}</p>

          <template #footer>
            <div class="flex items-center justify-between">
              <span v-if="post.publishedAt" class="text-sm text-neutral-500">
                {{ new Date(post.publishedAt).toLocaleDateString('fr-FR') }}
              </span>
              <div v-if="post.tags" class="flex gap-2">
                <UBadge
                  v-for="tag in post.tags.slice(0, 2)"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
