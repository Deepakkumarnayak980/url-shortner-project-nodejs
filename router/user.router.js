import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../model/users.model.js";
import { eq } from "drizzle-orm";
import { createHmac, randomBytes } from "crypto";
import { signupPostRequestBodySchema } from "../validation/request.validation.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body
  );

  // ❌ validationResult.error → WRONG
  // ✅ validationResult.success → CORRECT
  if (!validationResult.success) {
    return res.status(400).json({
      error: validationResult.error.format(),
    });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  // 🔍 Check existing user
  const [existingUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `User with email ${email} already exists!` });
  }

  // 🔐 Hash password
  const salt = randomBytes(256).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  // 📥 Insert user
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

export default router;
