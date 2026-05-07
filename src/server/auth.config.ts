import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword, hashPassword } from '~/utils/hashPassword'
import { RuoloUtente } from '~/utils/enums'
import { Utenti } from './db/entities'
import { initializeDBConnection } from '~/data-source'

declare module 'next-auth' {
  interface User {
    id: string
    ruolo?: RuoloUtente
    idSquadra: number
    squadra: string
    presidente: string
    email?: string | null
    image?: string | null
  }
}

async function authenticate(input: { username: string; password: string }) {
  console.info('authenticate: ' + input.username)
  try {
    await initializeDBConnection()

    // Recupera l'utente per username — confronto password separato
    // per supportare la lazy migration MD5 → bcrypt.
    const utente = await Utenti.findOne({
      where: { username: input.username.toLowerCase() },
    })

    if (!utente) {
      console.info('utente non trovato: ' + input.username)
      return null
    }

    const passwordMatch = await verifyPassword(input.password, utente.pwd)
    if (!passwordMatch) {
      console.info('password errata per: ' + input.username)
      return null
    }

    // Lazy migration: se l'hash corrente è MD5 (32 hex uppercase),
    // lo aggiorna silenziosamente a bcrypt al momento del login.
    if (/^[0-9A-F]{32}$/.test(utente.pwd)) {
      try {
        const bcryptHash = await hashPassword(input.password)
        await Utenti.update({ idUtente: utente.idUtente }, { pwd: bcryptHash })
        console.info('lazy migration MD5→bcrypt completata per: ' + input.username)
      } catch (migrationError) {
        // La migrazione è best-effort: un fallimento non blocca il login.
        console.error('lazy migration fallita per: ' + input.username, migrationError)
      }
    }

    console.info('utente autenticato: ' + utente.presidente)
    return utente
  } catch (error) {
    console.error('Si è verificato un errore', error)
    return null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'erFantacalcio',
      name: 'erFantacalcio',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const apiResponse = await authenticate({
          username: (credentials?.username as string) ?? '',
          password: (credentials?.password as string) ?? '',
        })

        if (apiResponse) {
          return {
            id: apiResponse.idUtente.toString(),
            ruolo: apiResponse.adminLevel
              ? RuoloUtente.admin
              : RuoloUtente.contributor,
            idSquadra: apiResponse.idUtente,
            squadra: apiResponse.nomeSquadra,
            presidente: apiResponse.presidente,
            email: apiResponse.mail,
            image: apiResponse.foto,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.ruolo = user.ruolo
        token.squadra = user.squadra
        token.idSquadra = user.idSquadra
        token.email = user.email
        token.image = user.image
        token.presidente = user.presidente
      }
      if (trigger === 'update' && session) {
        token.image = session?.user?.image as string
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          ruolo: token.ruolo as RuoloUtente,
          idSquadra: token.idSquadra as number,
          squadra: token.squadra as string,
          email: token.email!,
          presidente: token.presidente as string,
          image: token.image?.toString(),
        },
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export const getServerAuthSession = auth
