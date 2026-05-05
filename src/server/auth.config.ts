import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { computeMD5Hash } from '~/utils/hashPassword'
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

    const hashedPassword = computeMD5Hash(input.password)
    const utente = await Utenti.findOne({
      where: {
        username: input.username.toLowerCase(),
        pwd: hashedPassword,
      },
    })
    console.info('utente trovato: ' + (utente ? utente.presidente : 'null'))
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
