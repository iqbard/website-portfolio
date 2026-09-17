import { defineCollection, z } from 'astro:content';

export const collections = {
	work: defineCollection({
		type: 'content',
		schema: z.object({
			title: z.string(),
			category: z.enum([
				'Website Building',
				'Paid Media',
				'Ecommerce Management',
				'Social Media',
				'SEO & Content',
			]),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			highlights: z
				.array(
					z.object({
						value: z.string(),
						label: z.string(),
						detail: z.string().optional(),
					}),
				)
				.optional(),
			img: z.string(),
			img_alt: z.string().optional(),
		}),
	}),
	leads: defineCollection({
		type: 'content',
		schema: z.object({
			title: z.string(),
			name: z.string(),
			email: z.string().email(),
			message: z.string(),
			createdAt: z.coerce.date(),
			status: z.enum(['New', 'Contacted', 'Qualified', 'Closed']).default('New'),
		}),
	}),
};
