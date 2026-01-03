<script setup lang="ts">
useSeoMeta({
  title: 'About - Kylian Bardini',
  description: 'Learn more about my journey, experience, and passion for web development.',
  ogTitle: 'About - Kylian Bardini',
  ogDescription: 'Learn more about my journey, experience, and passion for web development.'
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-b from-neutral-900/20">
      <UContainer>
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-primary-500 mb-4">
            About Me
          </h1>
          <p class="text-xl text-neutral-400">
            Developer, problem solver, and continuous learner
          </p>
        </div>
      </UContainer>
    </section>

    <!-- About Content -->
    <HomeAbout />

    <!-- Experience Section -->
    <section class="py-20">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-primary-500 mb-8 text-center">
            Experience
          </h2>

          <div class="space-y-8">
            <!-- Experience Item -->
            <UCard>
              <div class="flex flex-col md:flex-row gap-4">
                <div class="md:w-1/4">
                  <div class="text-sm text-neutral-500">2022 - Present</div>
                </div>
                <div class="md:w-3/4">
                  <h3 class="text-xl font-semibold text-neutral-100 mb-2">
                    Full-Stack Developer
                  </h3>
                  <p class="text-primary-500 mb-3">Freelance</p>
                  <p class="text-neutral-400 mb-4">
                    Building modern web applications for clients using Vue, Nuxt, and Node.js.
                    Focus on creating performant, accessible, and maintainable solutions.
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <UBadge variant="soft">Vue.js</UBadge>
                    <UBadge variant="soft">Nuxt</UBadge>
                    <UBadge variant="soft">TypeScript</UBadge>
                    <UBadge variant="soft">Node.js</UBadge>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Add more experience items as needed -->
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Skills Section -->
    <HomeSkills />
  </div>
</template>
