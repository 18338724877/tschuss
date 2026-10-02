import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'nftItem',
  title: 'NFT Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
    }),
    defineField({
      name: 'artistLink',
      title: 'Artist Link',
      type: 'url',
    }),
    defineField({
      name: 'editionSize',
      title: 'Edition Size',
      type: 'string',
    }),
    defineField({
      name: 'mintDate',
      title: 'Mint Date',
      type: 'date',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
    }),
    defineField({
      name: 'tokenLink',
      title: 'Token Link (objkt.com)',
      type: 'url',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      description: 'Multiple images will populate the card scroller',
    }),
  ],
})