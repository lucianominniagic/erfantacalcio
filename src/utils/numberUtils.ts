export function generateUniqueRandomNumbers(
  min: number,
  max: number,
  count: number,
): number[] {
  if (max - min + 1 < count) {
    throw new Error('Impossibile generare numeri unici, controlla i parametri.')
  }

  const numbers: number[] = []
  while (numbers.length < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber)
    }
  }

  return numbers
}

export function formatToDecimalValue(valoreString: string): number {
  const valoreFormatted = valoreString
    .replace(',', '.')
    .replace('&nbsp;', '')
    .replace('sv', '')
    .replace('s,v,', '')
    .trim()
  return parseFloat(valoreFormatted)
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
    value ?? 0,
  )
