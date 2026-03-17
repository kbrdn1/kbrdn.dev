<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

// Navigation links (matching header)
const navLinks = computed(() => [
  { href: "#about", label: t("sections.about") },
  { href: "#skills", label: t("sections.skills") },
  { href: "#projects", label: t("sections.projects") },
  { href: "#experience", label: t("sections.experience") },
  { href: "#education", label: t("sections.education") },
]);

const socialLinks = [
  {
    href: "https://github.com/kbrdn1",
    icon: "i-simple-icons-github",
    label: "GitHub",
  },
  {
    href: "https://linkedin.com/in/kbrdn1",
    icon: "i-simple-icons-linkedin",
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/kbrdn1",
    icon: "i-simple-icons-x",
    label: "Twitter / X",
  },
];

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
    await $fetch("/api/contact", {
      method: "POST",
      body: form,
    });

    submitStatus.value = "success";
    form.name = "";
    form.email = "";
    form.message = "";

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
    class="w-full bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800"
  >
    <div class="mx-auto px-6 py-12 border-x border-neutral-200 dark:border-neutral-800" style="max-width: 80rem;">
      <!-- Three-column grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Left Column: Contact Form -->
        <div class="space-y-5 md:col-span-1">
          <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
            {{ t("footer.contact.title") }}
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ t("footer.contact.description") }}
          </p>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Name -->
            <div class="space-y-1.5">
              <label
                for="footer-name"
                class="block font-mono text-xs uppercase tracking-wider text-neutral-500"
              >
                {{ t("footer.contact.name") }}
              </label>
              <input
                id="footer-name"
                v-model="form.name"
                type="text"
                required
                :placeholder="t('footer.contact.namePlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm rounded-none',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
                    'focus:outline-none focus:ring-2 focus:ring-[#d4825d]/50 focus:border-[#d4825d]',
                    'transition-colors duration-200',
                  )
                "
              />
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label
                for="footer-email"
                class="block font-mono text-xs uppercase tracking-wider text-neutral-500"
              >
                {{ t("footer.contact.email") }}
              </label>
              <input
                id="footer-email"
                v-model="form.email"
                type="email"
                required
                :placeholder="t('footer.contact.emailPlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm rounded-none',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
                    'focus:outline-none focus:ring-2 focus:ring-[#d4825d]/50 focus:border-[#d4825d]',
                    'transition-colors duration-200',
                  )
                "
              />
            </div>

            <!-- Message -->
            <div class="space-y-1.5">
              <label
                for="footer-message"
                class="block font-mono text-xs uppercase tracking-wider text-neutral-500"
              >
                {{ t("footer.contact.message") }}
              </label>
              <textarea
                id="footer-message"
                v-model="form.message"
                required
                rows="4"
                :placeholder="t('footer.contact.messagePlaceholder')"
                :class="
                  cn(
                    'w-full px-3 py-2 text-sm resize-none rounded-none',
                    'bg-white dark:bg-neutral-900',
                    'border border-neutral-300 dark:border-neutral-700',
                    'text-neutral-900 dark:text-neutral-100',
                    'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
                    'focus:outline-none focus:ring-2 focus:ring-[#d4825d]/50 focus:border-[#d4825d]',
                    'transition-colors duration-200',
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
                  'w-full px-4 py-2.5 text-sm font-mono uppercase tracking-wider rounded-none',
                  'bg-[#d4825d] text-white',
                  'hover:bg-[#c0714e]',
                  'active:scale-[0.98]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
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

        <!-- Center Column: Navigation & Socials -->
        <div class="space-y-8 md:col-span-1">
          <!-- Navigation Links -->
          <div class="space-y-3">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ t("footer.navigation.title") }}
            </h3>
            <nav class="flex flex-col space-y-2">
              <a
                v-for="link in navLinks"
                :key="link.href"
                :href="link.href"
                class="text-sm text-neutral-400 hover:text-[#d4825d] transition-colors duration-200"
              >
                {{ link.label }}
              </a>
            </nav>
          </div>

          <!-- Social Links -->
          <div class="space-y-3">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ t("footer.links.title") }}
            </h3>
            <nav class="flex flex-col space-y-2">
              <a
                v-for="social in socialLinks"
                :key="social.href"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-400 hover:text-[#d4825d] transition-colors duration-200 inline-flex items-center gap-2"
              >
                <UIcon :name="social.icon" class="w-4 h-4" />
                {{ social.label }}
              </a>
            </nav>
          </div>
        </div>

        <!-- Right Column: Info -->
        <div class="space-y-8 md:col-span-1">
          <!-- Location -->
          <div class="space-y-2">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ t("footer.location.title") }}
            </h3>
            <p class="text-sm text-neutral-300">
              {{ t("footer.location.city") }}
            </p>
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ t("footer.availability.title") }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                />
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"
                />
              </span>
              <span class="text-sm text-neutral-300">
                {{ t("footer.availability.status") }}
              </span>
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              Email
            </h3>
            <a
              href="mailto:hello@kbrdn.dev"
              class="text-sm text-neutral-300 hover:text-[#d4825d] transition-colors duration-200"
            >
              hello@kbrdn.dev
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center"
      >
        <p class="text-xs text-neutral-500 text-center">
          &copy; {{ currentYear }} Kylian Bardini. {{ t("footer.copyright") }}
        </p>
      </div>
    </div>
  </footer>
</template>
