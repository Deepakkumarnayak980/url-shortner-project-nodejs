import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../model/users.model.js";
import { getUserByEmail } from "../service/user.service.js";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/request.validation.js";
import { hashedPasswordWithSalt } from "../utils/hash.util.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.format(),
    });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `User with email ${email} already exists!` });
  }

  const { salt, password: hashedPassword } = hashedPasswordWithSalt(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      firstname,
      lastname,
      email,
      salt,
      password: hashedPassword,
    })
    .returning({ id: usersTable.id });

  return res.status(201).json({ data: { userId: user.id } });
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const validationResult = await loginPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.format(),
    });
  }

  const { email, password } = validationResult.data;

  const user = await getUserByEmail(email);

  if (!user) {
    return res
      .status(404)
      .json({ error: `User with email ${email} does not exist` });
  }

  // ⭐ Re-hash entered password using stored salt
  const { password: hashedInputPassword } = hashedPasswordWithSalt(
    password,
    user.salt
  );

  // ❌ Wrong password
  if (hashedInputPassword !== user.password) {
    return res.status(400).json({ error: "Invalid password" });
  }

  // 🎫 Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({ token });
});

export default router;
