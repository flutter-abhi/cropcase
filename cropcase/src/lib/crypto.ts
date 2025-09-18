// Frontend password hashing using Web Crypto API
// WARNING: This is for demonstration only. Real applications should hash passwords server-side only.

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex; // deterministic SHA-256 string
}

// Example usage in login/signup forms
export async function hashPasswordForAuth(password: string): Promise<string> {
    try {
        return await hashPassword(password);
    } catch (error) {
        console.error('Password hashing failed:', error);
        throw new Error('Password hashing failed');
    }
}
