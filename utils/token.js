import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validation/token.validation.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Create User Token
export async function createUserToken(payload) {
    // Validate payload with Zod
    const validationResult = await userTokenSchema.safeParseAsync(payload);

    if (validationResult.error) {
        throw new Error(validationResult.error.message);
    }

    const safeData = validationResult.data;

    // Add token expiry (recommended)
    const token = jwt.sign(
        safeData,
        JWT_SECRET,
        { expiresIn: "7d" } // <-- good practice!
    );

    return token;
}

// Validate Token
export function validationUserToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // invalid or expired token
    }
}
