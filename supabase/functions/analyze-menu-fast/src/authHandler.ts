
export async function authenticateUser(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !userData.user) {
    throw new Error(`Authentication failed: ${userError?.message || 'Invalid token'}`);
  }

  return userData.user;
}
