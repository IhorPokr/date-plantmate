import { supabase } from '../../constants/supabaseClient';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('Sign-Up Error:', error.message); // Log only the error message
  } else {
    const { user, session } = data;
    console.log('Sign-Up Successful:');
    console.log('User:', {
      id: user?.id,
      email: user?.email,
    });
    console.log('Session:', {
      accessToken: session?.access_token,
      expiresIn: session?.expires_in,
    });
  }
}


export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message); // Log only the error message
  } else {
    const { user, session } = data;
    console.log('Login Successful:');
    console.log('User:', {
      id: user?.id,
      email: user?.email,
    });
    console.log('Session:', {
      accessToken: session?.access_token,
      expiresIn: session?.expires_in,
    });
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout Error:', error.message);
  } else {
    console.log('User Logged Out');
  }
}
