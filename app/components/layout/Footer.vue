<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

// Form state
const form = reactive({
  name: "",
  email: "",
  message: "",
});

const isSubmitting = ref(false);
const submitStatus = ref<"idle" | "success" | "error">("idle");

async function handleSubmit() {
  isSubmitting.value = true;
  submitStatus.value = "idle";

  try {
    // Send to API endpoint
    await $fetch("/api/contact", {
      method: "POST",
      body: form,
    });

    submitStatus.value = "success";
    // Reset form
    form.name = "";
    form.email = "";
    form.message = "";

    // Reset status after 5 seconds
    setTimeout(() => {
      submitStatus.value = "idle";
    }, 5000);
  } catch {
    submitStatus.value = "error";
  } finally {
    isSubmitting.value = false;
  }
}

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="w-full border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
  >
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Two columns layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Left: Contact Form -->
        <div class="space-y-4">
          <h3
            class="text-lg font-medium text-neutral-900 dark:text-neutral-100"
          >
            {{ t("footer.contact.title") }}
          </h3>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ t("footer.contact.description") }}
          </p>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Name -->
            <div class="space-y-1">
              <label
                for="name"
                class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
              >
                {{ t("footer.contact.name") }}
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                :placeholder="t('footer.contact.namePlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                    'transition-colors',
                  )
                "
              />
            </div>

            <!-- Email -->
            <div class="space-y-1">
              <label
                for="email"
                class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
              >
                {{ t("footer.contact.email") }}
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                :placeholder="t('footer.contact.emailPlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                    'transition-colors',
                  )
                "
              />
            </div>

            <!-- Message -->
            <div class="space-y-1">
              <label
                for="message"
                class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
              >
                {{ t("footer.contact.message") }}
              </label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="4"
                :placeholder="t('footer.contact.messagePlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm resize-none',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                    'transition-colors',
                  )
                "
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              :class="
                cn(
                  'w-full px-4 py-2 text-sm font-medium uppercase tracking-wider',
                  'bg-neutral-900 dark:bg-neutral-100',
                  'text-neutral-100 dark:text-neutral-900',
                  'hover:bg-neutral-800 dark:hover:bg-neutral-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors',
                )
              "
            >
              <span
                v-if="isSubmitting"
                class="flex items-center justify-center gap-2"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-4 h-4 animate-spin"
                />
                {{ t("footer.contact.sending") }}
              </span>
              <span v-else>{{ t("footer.contact.send") }}</span>
            </button>

            <!-- Status Messages -->
            <p
              v-if="submitStatus === 'success'"
              class="text-sm text-green-600 dark:text-green-400"
            >
              {{ t("footer.contact.success") }}
            </p>
            <p
              v-if="submitStatus === 'error'"
              class="text-sm text-red-600 dark:text-red-400"
            >
              {{ t("footer.contact.error") }}
            </p>
          </form>
        </div>

        <!-- Right: Info & Links -->
        <div class="space-y-6">
          <!-- Quick Links -->
          <div class="space-y-3">
            <h3
              class="text-lg font-medium text-neutral-900 dark:text-neutral-100"
            >
              {{ t("footer.links.title") }}
            </h3>
            <nav class="flex flex-col space-y-2">
              <a
                href="https://github.com/kbrdn1"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-github" class="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/kbrdn1"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-linkedin" class="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href="https://twitter.com/kbrdn1"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-2"
              >
                <UIcon name="i-simple-icons-x" class="w-4 h-4" />
                Twitter / X
              </a>
            </nav>
          </div>

          <!-- Location -->
          <div class="space-y-2">
            <h4
              class="text-sm font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider"
            >
              {{ t("footer.location.title") }}
            </h4>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ t("footer.location.city") }}
            </p>
          </div>

          <!-- Availability -->
          <div class="space-y-2">
            <h4
              class="text-sm font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wider"
            >
              {{ t("footer.availability.title") }}
            </h4>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                />
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"
                />
              </span>
              <span class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ t("footer.availability.status") }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom copyright -->
      <div
        class="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800"
      >
        <p class="text-xs text-center text-neutral-500 dark:text-neutral-500">
          © {{ currentYear }} Kylian Bardini. {{ t("footer.copyright") }}
        </p>
      </div>
    </div>
  </footer>
</template>
