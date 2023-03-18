import { z, defineCollection } from 'astro:content';

import { footerSchema } from '@app/model';
import { navSchema } from '@app/model';

const footerCollection = defineCollection({
  schema: footerSchema,
});

const navCollection = defineCollection({
  schema: navSchema,
});

export const collections = {
  'footer': footerCollection,
  'nav': navCollection,
};