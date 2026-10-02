import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'mys1vx17',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})