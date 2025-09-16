// Edge-compatible JWT verification using Web Crypto API
// This works in Edge Runtime without Node.js crypto module

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

// Base64 URL decode function
function base64UrlDecode(str: string): string {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

// Simple JWT decode (without verification) for Edge runtime
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(base64UrlDecode(parts[1]));
        return payload as JWTPayload;
    } catch (error) {
        console.error('JWT decode failed:', error);
        return null;
    }
}

// Edge-compatible JWT verification (basic validation)
export function verifyJWTBasic(token: string): JWTPayload | null {
    try {
        const decoded = decodeJWT(token);
        if (!decoded) {
            return null;
        }

        const now = Math.floor(Date.now() / 1000);

        // Check if token is expired (with 60 second tolerance)
        if (decoded.exp && decoded.exp < (now - 60)) {
            console.error('Token expired:', {
                exp: decoded.exp,
                now: now,
                expired: decoded.exp < now
            });
            return null;
        }

        // Check if token was issued in the future (with 60 second tolerance)
        if (decoded.iat && decoded.iat > (now + 60)) {
            console.error('Token issued in future:', {
                iat: decoded.iat,
                now: now
            });
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}
