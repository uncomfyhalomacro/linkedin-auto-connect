import { randomBytes } from "node:crypto";

function decodeBase64ToUint8Array(base64: string) {
	const binaryString = atob(base64);
	const len = binaryString.length;
	console.log("key len", len);
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}
async function testEncryption() {
	const someJSStruct = {
		name: "Soc",
	};

	const jsString = JSON.stringify(someJSStruct);
	const encoder = new TextEncoder();
	const data = encoder.encode(jsString);

	const key = await crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256, // Key length in bits (e.g., 128, 192, or 256)
		},
		true, // The key is extractable (can be exported)
		["encrypt", "decrypt"], // Key usages: for encryption and decryption
	);

	const iv = randomBytes(16);

	const encryptedData = Buffer.from(await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		data,
	));

	const combined = Buffer.concat([iv, new Uint8Array(encryptedData)]);
	const combinedBase64 = combined.toString("base64");
	console.log(combinedBase64);

	const fromBase64Combined = decodeBase64ToUint8Array(combinedBase64);

	const ivFromCombined = fromBase64Combined.subarray(0, 16);
	const encryptedDataFromCombined = fromBase64Combined.subarray(16);

	const exportKey = await crypto.subtle.exportKey("raw", key);
	const exportKeyBase64 = Buffer.from(exportKey).toString("base64");

	console.log("KEY: ", exportKeyBase64);

	const fromBase64Key = decodeBase64ToUint8Array(exportKeyBase64);

	const importedKey = await crypto.subtle.importKey(
		"raw",
		fromBase64Key,
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	const decryptedData = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: ivFromCombined },
		importedKey,
		encryptedDataFromCombined,
	);

	console.log(new TextDecoder().decode(decryptedData));
}

testEncryption();
