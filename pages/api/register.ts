import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { createSerializedRegisterSessionTokenCookie } from '../../util/cookies';
import {
  createSession,
  createUser,
  getUserByUsername,
} from '../../util/database';

export type RegisterResponseBody =
  | {
      errors: {
        message: string;
      }[];
    }
  | { user: { id: number } };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponseBody>,
) {
  if (req.method === 'POST') {
    if (
      typeof req.body.username !== 'string' ||
      typeof req.body.password !== 'string' ||
      !req.body.username ||
      !req.body.password
    ) {
      res
        .status(400)
        .json({ errors: [{ message: 'username or password not provided' }] });
      return;
    }
    if (await getUserByUsername(req.body.username)) {
      res.status(401).json({ errors: [{ message: 'username already taken' }] });
      return;
    }
    const user = req.body;
    const username = user.username;
    const passwordHash = await bcrypt.hash(user.password, 12);
    const newUser = await createUser(req.body.username, passwordHash);
    const token = crypto.randomBytes(80).toString('base64');
    const session = await createSession(token, newUser.id);
    const serializeCookie = await createSerializedRegisterSessionTokenCookie(
      session.token,
    );
    console.log('user', username.username);
    console.log('user', passwordHash);
    console.log('new user', newUser);
    res
      .status(200)
      .setHeader('set-Cookie', serializeCookie)
      .json({ user: { id: newUser.id } });
    res.status(200).json({ user: { id: newUser.id } });
  } else {
    res.status(405).json({ errors: [{ message: 'method not allowed' }] });
  }
}
