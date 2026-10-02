import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pngImage',
  title: 'PNG Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      description: 'Short description for accessibility (screen readers)',
    }),
  ],
})