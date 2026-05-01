import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get the response from the route handler
  const response = await resolve(event);
  
  // For API requests, we can't directly intercept the response here
  // So instead, we'll need to add the logic to each API call
  // But we can add headers to help identify API responses if needed
  
  return response;
};