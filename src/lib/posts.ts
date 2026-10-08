import { getCollection } from 'astro:content';
import { published, readingTime } from './content.mjs';
export async function getPosts() {
  return published(await getCollection('posts')).map(post => ({ ...post, minutes: readingTime(post.body ?? '') }));
}
