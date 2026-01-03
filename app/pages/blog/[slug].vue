<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: post } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').path(`/blog/${slug}`).first()
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    message: 'Article non trouvé'
  })
}

useSeoMeta({
  title: post.value.title,
  description: post.value.description
})
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <article class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <UButton
          to="/blog"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          class="mb-6"
        >
          Retour au blog
        </UButton>

        <h1 class="text-4xl font-bold text-neutral-100 mb-4">{{ post.title }}</h1>

        <div class="flex items-center gap-4 text-neutral-500">
          <span v-if="post.publishedAt">
            {{ new Date(post.publishedAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) }}
          </span>
          <div v-if="post.tags" class="flex gap-2">
            <UBadge
              v-for="tag in post.tags"
              :key="tag"
              color="primary"
              variant="subtle"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>
      </header>

      <!-- Content -->
      <ContentRenderer :value="post" class="prose prose-invert max-w-none" />
    </article>
  </div>
</template>
