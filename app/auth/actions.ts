'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { turso } from '@/lib/turso'
import nodemailer from 'nodemailer'

export async function sendOtp(email: string) {
  if (!email) return { error: "Email is required" };

  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  try {
    // Save to Turso
    await turso.execute({
      sql: `INSERT INTO otps (email, code, expires_at) VALUES (?, ?, ?) 
            ON CONFLICT(email) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at`,
      args: [email, code, expiresAt]
    });

    // Send via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Braco OmniPulse" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OmniPulse Login Code",
      text: `Your login code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Braco OmniPulse</h2>
          <p>Your one-time login code is:</p>
          <h1 style="letter-spacing: 5px; color: #183B2B;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: "Failed to send OTP. Please check your Gmail credentials in .env.local" };
  }
}

export async function registerUserAndSendOtp(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;

  if (!email || !name) return { error: "Email and Name are required" };

  try {
    // Save to users table
    await turso.execute({
      sql: `INSERT INTO users (email, name, company) VALUES (?, ?, ?) 
            ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company`,
      args: [email, name, company]
    });

    // Send OTP
    return await sendOtp(email);
  } catch (err: any) {
    console.error(err);
    return { error: "Failed to register user." };
  }
}

export async function verifyOtpAndLogin(email: string, code: string) {
  try {
    const result = await turso.execute({
      sql: "SELECT * FROM otps WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) {
      return { error: "No OTP found for this email. Please request a new one." };
    }

    const record = result.rows[0];
    
    if (record.code !== code) {
      return { error: "Invalid OTP code." };
    }

    if (Date.now() > (record.expires_at as number)) {
      return { error: "OTP has expired. Please request a new one." };
    }

    // Delete OTP after successful use
    await turso.execute({
      sql: "DELETE FROM otps WHERE email = ?",
      args: [email]
    });

    // Login successful - Set session
    const cookieStore = await cookies();
    cookieStore.set('session', email, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: "Verification failed." };
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const cookieStore = await cookies();
  cookieStore.set('session', email, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  redirect('/dashboard')
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/sign-in')
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value || null;
}
