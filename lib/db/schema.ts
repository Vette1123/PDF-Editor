import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, boolean, integer, index, unique } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (t) => [index('session_userId_idx').on(t.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (t) => [index('account_userId_idx').on(t.userId)])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (t) => [index('verification_identifier_idx').on(t.identifier)])

export const signature = pgTable('signature', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dataUrl: text('data_url').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [index('signature_userId_idx').on(t.userId)])

// Annotation drafts ("recent documents"). Stores the annotation JSON + the
// document name only — never the PDF bytes (those stay in the browser via
// lib/editor/pdf-store). `docId` mirrors the local IndexedDB id so a draft can
// be matched back to its local file on return.
export const document = pgTable('document', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  docId: text('doc_id').notNull(),
  name: text('name').notNull(),
  annotations: text('annotations').notNull().default('[]'),
  pageCount: integer('page_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (t) => [
  index('document_userId_idx').on(t.userId),
  unique('document_user_doc_unique').on(t.userId, t.docId),
])

// Per-user editor preferences (theme, default font, default zoom).
export const userPreference = pgTable('user_preference', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  theme: text('theme'),
  defaultFont: text('default_font'),
  defaultZoom: integer('default_zoom'),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  signatures: many(signature),
  documents: many(document),
  preference: one(userPreference, { fields: [user.id], references: [userPreference.userId] }),
}))
export const signatureRelations = relations(signature, ({ one }) => ({
  user: one(user, { fields: [signature.userId], references: [user.id] }),
}))
export const documentRelations = relations(document, ({ one }) => ({
  user: one(user, { fields: [document.userId], references: [user.id] }),
}))
export const userPreferenceRelations = relations(userPreference, ({ one }) => ({
  user: one(user, { fields: [userPreference.userId], references: [user.id] }),
}))
