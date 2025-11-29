import { validationUserToken } from "../utils/token.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

export function authenticationMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    // If no auth header → just continue WITHOUT user
    if (!authHeader) return next();

    // Validate format: must start with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
        return res
            .status(400)
            .json({ error: "Authorization header must start with Bearer" });
    }

    const token = authHeader.split(" ")[1];

    const payload = validationUserToken(token);

    // If token is invalid or expired
    if (!payload) {
        return res
            .status(401)
            .json({ error: "Invalid or expired token" });
    }

    req.user = payload;
    next();
}


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function ensureAuthenticated(req, res, next) {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: 'You must be logged in to access this resource' });
  }
  next();
}
