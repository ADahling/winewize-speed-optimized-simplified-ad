export async function authenticateUser(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !user) {
    throw new Error(`Authentication failed: ${error?.message || 'Invalid user'}`);
  }

  return user;
}
