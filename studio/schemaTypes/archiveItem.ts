import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'archiveItem',
  title: 'Archive Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dropNumber',
      title: 'Drop Number',
      type: 'string',
      description: 'e.g. "1.1" or "2.1"',
    }),
    defineField({
      name: 'editionSize',
      title: 'Edition Size',
      type: 'string',
    }),
    defineField({
      name: 'materials',
      title: 'Materials',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
  ],
})