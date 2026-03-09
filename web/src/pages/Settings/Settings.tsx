import './models/init'

import { useRef } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Download, Check, ChevronDown } from 'lucide-react'

import { PASSWORD_MIN } from '@shared/constants'

import { routes } from '@core/router'
import { $session } from '@logic/session'

import { Layout } from '@modules/Layout'

import {
  $form,
  $passwordForm,
  $isDirty,
  $isPasswordDirty,
  $avatarPreview,
  fieldChanged,
  passwordFieldChanged,
  avatarSelected,
  submitted,
  updateProfileFx,
  changePasswordFx,
  uploadAvatarFx
} from './models'

import s from './Settings.module.scss'

export const route = routes.settings

export const Settings = () => {
  const [session, form, passwordForm, isDirty, isPasswordDirty, avatarPreview] = useUnit([
    $session, $form, $passwordForm, $isDirty, $isPasswordDirty, $avatarPreview
  ])
  const [onFieldChange, onPasswordChange, onAvatarSelect, onSubmit] = useUnit([
    fieldChanged, passwordFieldChanged, avatarSelected, submitted
  ])
  const [profilePending, passwordPending, avatarPending] = useUnit([
    updateProfileFx.pending, changePasswordFx.pending, uploadAvatarFx.pending
  ])

  const fileRef = useRef<HTMLInputElement>(null)

  const pending = profilePending || passwordPending || avatarPending
  const canSubmit = (isDirty || isPasswordDirty) && !pending

  // валидация пароля
  const passwordMismatch = passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword !== passwordForm.confirmPassword
  const passwordTooShort = passwordForm.newPassword.length > 0 &&
    passwordForm.newPassword.length < PASSWORD_MIN

  const avatarSrc = avatarPreview || session?.avatarUrl

  const headerAction = (
    <button
      type="button"
      aria-label="Сохранить"
      className={s.headerCheck}
      disabled={!canSubmit}
      onClick={() => onSubmit()}
    >
      <Check size={24} />
    </button>
  )

  return (
    <Layout title={<Trans>Настройки</Trans>} contentClassName={s.content} headerAction={headerAction}>
      <title>{t`Настройки / Мяутер`}</title>

      {/* Avatar */}
      <div className={s.avatarSection}>
        <div className={s.avatarWrap}>
          {avatarSrc
            ? <img className={s.avatar} src={avatarSrc} alt="" />
            : <div className={s.avatarPlaceholder} />
          }
          <label className={s.avatarUpload}>
            <Download size={18} />
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={s.avatarInput}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onAvatarSelect(file)
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Общая информация */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}><Trans>Общая информация</Trans></h3>

        <input
          id="displayName"
          name="displayName"
          className={s.input}
          placeholder={t`Отображаемое имя`}
          value={form.displayName}
          onChange={(e) => onFieldChange({ field: 'displayName', value: e.target.value })}
        />

        <input
          id="firstName"
          name="firstName"
          className={s.input}
          placeholder={t`Имя`}
          value={form.firstName}
          onChange={(e) => onFieldChange({ field: 'firstName', value: e.target.value })}
        />

        <input
          id="lastName"
          name="lastName"
          className={s.input}
          placeholder={t`Фамилия`}
          value={form.lastName}
          onChange={(e) => onFieldChange({ field: 'lastName', value: e.target.value })}
        />

        <div className={s.selectWrap}>
          <select
            id="sex"
            name="sex"
            aria-label={t`Пол не выбран`}
            className={s.select}
            value={form.sex}
            onChange={(e) => onFieldChange({ field: 'sex', value: e.target.value })}
          >
            <option value="">{t`Пол не выбран`}</option>
            <option value="MALE">{t`Мужской`}</option>
            <option value="FEMALE">{t`Женский`}</option>
          </select>
          <ChevronDown size={16} className={s.selectIcon} />
        </div>

        <textarea
          id="bio"
          name="bio"
          className={s.textarea}
          placeholder={t`О себе`}
          value={form.bio}
          onChange={(e) => onFieldChange({ field: 'bio', value: e.target.value })}
        />
      </div>

      {/* Контакты */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}><Trans>Контакты</Trans></h3>

        <input
          id="contacts"
          name="contacts"
          className={s.input}
          placeholder={t`Email, ссылка или телефон`}
          value={form.contacts}
          onChange={(e) => onFieldChange({ field: 'contacts', value: e.target.value })}
        />
      </div>

      {/* Безопасность */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}><Trans>Безопасность</Trans></h3>

        <input
          id="oldPassword"
          name="oldPassword"
          className={s.input}
          type="password"
          placeholder={t`Введите старый пароль`}
          value={passwordForm.oldPassword}
          onChange={(e) => onPasswordChange({ field: 'oldPassword', value: e.target.value })}
        />

        <div className={s.fieldWrap}>
          <input
            id="newPassword"
            name="newPassword"
            className={s.input}
            type="password"
            placeholder={t`Придумайте новый пароль`}
            value={passwordForm.newPassword}
            onChange={(e) => onPasswordChange({ field: 'newPassword', value: e.target.value })}
          />
          {passwordTooShort && (
            <span className={s.fieldError}>
              <Trans>Минимум {PASSWORD_MIN} символов</Trans>
            </span>
          )}
        </div>

        <div className={s.fieldWrap}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            className={s.input}
            type="password"
            placeholder={t`Повторите пароль`}
            value={passwordForm.confirmPassword}
            onChange={(e) => onPasswordChange({ field: 'confirmPassword', value: e.target.value })}
          />
          {passwordMismatch && (
            <span className={s.fieldError}>
              <Trans>Пароли не совпадают</Trans>
            </span>
          )}
        </div>
      </div>

      {/* Обновить = только десктоп */}
      <button
        className={s.submit}
        disabled={!canSubmit}
        onClick={() => onSubmit()}
      >
        <Trans>Обновить</Trans>
      </button>
    </Layout>
  )
}
