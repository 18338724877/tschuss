import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'nftPurchase',
  title: 'NFT Purchase',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'tokenId', title: 'Token ID', type: 'string'}),
    defineField({name: 'faContract', title: 'FA Contract', type: 'string'}),
    defineField({name: 'image', title: 'Image', type: 'image'}),
    defineField({name: 'artist', title: 'Artist', type: 'string'}),
    defineField({name: 'artistUrl', title: 'Artist URL', type: 'url'}),
    defineField({name: 'supply', title: 'Edition Size', type: 'number'}),
    defineField({name: 'purchasedAt', title: 'Purchased At', type: 'datetime'}),
    defineField({name: 'paidMutez', title: 'Paid (mutez)', type: 'number'}),
    defineField({name: 'tokenUrl', title: 'Token URL', type: 'url'}),
  ],
})
