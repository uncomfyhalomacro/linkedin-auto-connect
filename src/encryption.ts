import { randomBytes } from "node:crypto";
import type { StorageState } from "./types.ts";

async function encryptJson(cookies: StorageState) {
	const jsonString = JSON.stringify(cookies);
	const encoder = new TextEncoder();
	const data = encoder.encode(jsonString);
	const key = await crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256, // Key length in bits (e.g., 128, 192, or 256)
		},
		true, // The key is extractable (can be exported)
		["encrypt", "decrypt"], // Key usages: for encryption and decryption
	);

	// Generate a random IV for each encryption
	const iv = randomBytes(16); // 16 bytes for AES-GCM

	const encryptedData = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		data,
	);

	const exportedKey = Buffer.from(await crypto.subtle.exportKey("raw", key));

	const combined = Buffer.concat([iv, new Uint8Array(encryptedData)]);

	return { exportedKey, combined }; // Returns an { Buffer<ArrayBuffer>, Buffer<ArrayBuffer> }
}

function decodeBase64ToUint8Array(base64: string) {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

async function decryptJson(data: string, key: string): Promise<StorageState> {
	const keyBytes = decodeBase64ToUint8Array(key);
	const encryptedData = decodeBase64ToUint8Array(data);
	const importedKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	const iv = encryptedData.subarray(0, 16);

	const decryptedData = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: iv },
		importedKey,
		encryptedData.subarray(16),
	);

	const decoder = new TextDecoder();
	const jsonString = decoder.decode(decryptedData);
	return JSON.parse(jsonString);
}

export { decryptJson, encryptJson, decodeBase64ToUint8Array };
