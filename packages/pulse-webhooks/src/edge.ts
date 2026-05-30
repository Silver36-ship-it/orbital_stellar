import type { NormalizedEvent } from "@orbital/pulse-core";

/**
 * Verifies webhook signature and returns parsed event using Web Crypto API.
 * Compatible with Cloudflare Workers, Deno, and browsers.
 * Use when you need to access the event payload immediately.
 *
 * @param payload - The raw request body
 * @param signature - The x-orbital-signature header value
 * @param secret - Your webhook secret
 * @param timestamp - The x-orbital-timestamp header value
 * @returns Parsed NormalizedEvent if verification succeeds, null otherwise
 */
export async function verifyWebhookEdge(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
): Promise<NormalizedEvent | null> {
  if (!(await verifyWebhookEdgeRaw(payload, signature, secret, timestamp))) {
    return null;
  }

  try {
    return JSON.parse(payload) as NormalizedEvent;
  } catch {
    return null;
  }
}

/**
 * Verifies webhook signature without parsing JSON using Web Crypto API.
 * Compatible with Cloudflare Workers, Deno, and browsers.
 * Use when routing raw body to another consumer (e.g., queue) to avoid parse overhead.
 *
 * @param payload - The raw request body
 * @param signature - The x-orbital-signature header value
 * @param secret - Your webhook secret
 * @param timestamp - The x-orbital-timestamp header value
 * @returns Promise<true> if signature is valid, Promise<false> otherwise
 */
export async function verifyWebhookEdgeRaw(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
): Promise<boolean> {
  // Validate timestamp format
  if (!/^\d+$/.test(timestamp)) return false;

  try {
    // Import the secret key
    const keyData = new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Create the expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload),
    );

    // Convert received signature to bytes
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );

    // Constant-time comparison
    const expectedBytes = new Uint8Array(expectedBuffer);
    if (expectedBytes.length !== signatureBytes.length) return false;

    let result = 0;
    for (let i = 0; i < expectedBytes.length; i++) {
      result |= (expectedBytes[i] || 0) ^ (signatureBytes[i] || 0);
    }

    return result === 0;
  } catch {
    return false;
  }
}
