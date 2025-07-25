
// Inline Deno type declarations to avoid import issues
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

import { verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { createErrorResponse } from './responseHandler.ts';

const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET') || 'super-secret-jwt-token-with-at-least-32-characters'; // Fallback for local testing

interface User {
  id: string;
  email: string;
  role: string;
}

export async function authenticateUser(req: Request, supabaseClient: any): Promise<User> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    console.warn('Missing Authorization header');
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('Invalid Authorization header format');
    throw new Error('Invalid Authorization header format');
  }

  try {
    const jwtPayload: any = await verify(token, JWT_SECRET, 'HS256');

    if (!jwtPayload || !jwtPayload.sub) {
      console.warn('Invalid JWT payload or missing subject');
      throw new Error('Invalid JWT');
    }

    // Fetch user from database to verify existence and role
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, role')
      .eq('id', jwtPayload.sub)
      .single();

    if (userError || !user) {
      console.error('Failed to fetch user from database:', userError);
      throw new Error('User not found or invalid');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };

  } catch (jwtError) {
    console.error('JWT verification error:', jwtError);
    throw new Error(`Invalid JWT: ${jwtError.message}`);
  }
}
