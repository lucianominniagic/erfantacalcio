import { generateUniqueRandomNumbers } from './numberUtils'

export function RoundRobin8(): Partita[] {
  const squadre = generateUniqueRandomNumbers(1, 8, 8)
  const abbinamenti: Partita[] = []

  // GIORNATA 1
  abbinamenti.push(new Partita(1, squadre[7], squadre[6]))
  abbinamenti.push(new Partita(1, squadre[0], squadre[5]))
  abbinamenti.push(new Partita(1, squadre[1], squadre[4]))
  abbinamenti.push(new Partita(1, squadre[2], squadre[3]))

  // GIORNATA 2
  abbinamenti.push(new Partita(2, squadre[3], squadre[7]))
  abbinamenti.push(new Partita(2, squadre[4], squadre[2]))
  abbinamenti.push(new Partita(2, squadre[5], squadre[1]))
  abbinamenti.push(new Partita(2, squadre[6], squadre[0]))

  // GIORNATA 3
  abbinamenti.push(new Partita(3, squadre[2], squadre[7]))
  abbinamenti.push(new Partita(3, squadre[3], squadre[1]))
  abbinamenti.push(new Partita(3, squadre[4], squadre[0]))
  abbinamenti.push(new Partita(3, squadre[5], squadre[6]))

  // GIORNATA 4
  abbinamenti.push(new Partita(4, squadre[7], squadre[5]))
  abbinamenti.push(new Partita(4, squadre[6], squadre[4]))
  abbinamenti.push(new Partita(4, squadre[0], squadre[3]))
  abbinamenti.push(new Partita(4, squadre[1], squadre[2]))

  // GIORNATA 5
  abbinamenti.push(new Partita(5, squadre[1], squadre[7]))
  abbinamenti.push(new Partita(5, squadre[2], squadre[0]))
  abbinamenti.push(new Partita(5, squadre[3], squadre[6]))
  abbinamenti.push(new Partita(5, squadre[4], squadre[5]))

  // GIORNATA 6
  abbinamenti.push(new Partita(6, squadre[7], squadre[4]))
  abbinamenti.push(new Partita(6, squadre[5], squadre[3]))
  abbinamenti.push(new Partita(6, squadre[6], squadre[2]))
  abbinamenti.push(new Partita(6, squadre[0], squadre[1]))

  // GIORNATA 7
  abbinamenti.push(new Partita(7, squadre[0], squadre[7]))
  abbinamenti.push(new Partita(7, squadre[1], squadre[6]))
  abbinamenti.push(new Partita(7, squadre[2], squadre[5]))
  abbinamenti.push(new Partita(7, squadre[3], squadre[4]))

  return abbinamenti
}

export function RoundRobin4(): Partita[] {
  const squadre = generateUniqueRandomNumbers(1, 4, 4)

  const abbinamenti: Partita[] = []

  // GIORNATA 1
  abbinamenti.push(new Partita(1, squadre[0], squadre[3]))
  abbinamenti.push(new Partita(1, squadre[1], squadre[2]))

  // GIORNATA 2
  abbinamenti.push(new Partita(2, squadre[2], squadre[0]))
  abbinamenti.push(new Partita(2, squadre[3], squadre[1]))

  // GIORNATA 3
  abbinamenti.push(new Partita(3, squadre[0], squadre[1]))
  abbinamenti.push(new Partita(3, squadre[2], squadre[3]))

  return abbinamenti
}

export class Partita {
  constructor(
    public giornata: number,
    public squadraHome: number,
    public squadraAway: number,
  ) {}
}
