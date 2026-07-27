import type { useTranslations } from 'next-intl';
import { z } from 'zod';

type TranslationFn = ReturnType<typeof useTranslations>;

const PASSWORD_MIN_LENGTH = 8;

export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(PASSWORD_MIN_LENGTH, t('passwordMin')),
  });
}

export function createChangePasswordSchema(t: TranslationFn) {
  return z
    .object({
      email: z.string().email(t('invalidEmail')),
      current_password: z
        .string()
        .min(PASSWORD_MIN_LENGTH, t('currentPasswordMin')),
      new_password: z.string().min(PASSWORD_MIN_LENGTH, t('newPasswordMin')),
      new_password_confirmation: z
        .string()
        .min(PASSWORD_MIN_LENGTH, t('confirmPasswordRequired')),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: t('passwordsDoNotMatch'),
      path: ['new_password_confirmation'],
    });
}

export function createResetPasswordSchema(t: TranslationFn) {
  return z
    .object({
      email: z.string().email(t('invalidEmail')),
      password: z.string().min(PASSWORD_MIN_LENGTH, t('newPasswordMin')),
      password_confirmation: z
        .string()
        .min(PASSWORD_MIN_LENGTH, t('confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('passwordsDoNotMatch'),
      path: ['password_confirmation'],
    });
}

export function createPhoneSchemas(t: TranslationFn) {
  const phoneNumberSchema = z
    .string()
    .min(1, t('phoneRequired'))
    .refine((phone) => /^\+?\d{10,15}$/.test(phone.replace(/[^\d+]/g, '')), {
      message: t('phoneInvalid'),
    });

  const optionalPhoneSchema = z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === '') return true;
        return /^\+?\d{10,15}$/.test(phone.replace(/[^\d+]/g, ''));
      },
      { message: t('phoneOptionalInvalid') },
    );

  return { phoneNumberSchema, optionalPhoneSchema };
}
