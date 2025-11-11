'use server';

import { registerUserService } from '@/lib/strapi';
import { type FormState, SignupFormSchema } from '@/validations/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import z from 'zod';

const cookieConfig = {
  maxAge: 60 * 60 * 24 * 7, // 1 week,
  path: '/',
  httpOnly: true, // only accessible by the server
  domain: process.env.HOST ?? 'localhost',
  secure: process.env.NODE_ENV === 'production',
};

export async function registerUserAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const fields = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedFields = SignupFormSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Validation errors occurred',
      strapiErrors: null,
      zodErrors: flattenedErrors.fieldErrors,
      data: {
        ...prevState.data,
        ...fields,
      },
    };
  }

  const response = await registerUserService(validatedFields.data);

  if (!response || response.error) {
    return {
      success: false,
      message: 'Registration failed',
      strapiErrors: response?.error || null,
      zodErrors: null,
      data: {
        ...prevState.data,
        ...fields,
      },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set('jwt', response.jwt, cookieConfig);
  redirect('/dashboard');
}
