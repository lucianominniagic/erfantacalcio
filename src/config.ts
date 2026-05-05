export const Configurazione = {
  stagione: process.env.NEXT_PUBLIC_STAGIONE ?? '',
  stagionePrecedente: process.env.NEXT_PUBLIC_STAGIONEPRECEDENTE ?? '',
  recordCount: parseInt(process.env.NEXT_PUBLIC_RECORDCOUNT ?? '20', 10),
  percentualeMinimaGiocate: parseInt(
    process.env.NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE ?? '30',
    10,
  ),
  importoMulta: parseInt(process.env.NEXT_PUBLIC_MULTA ?? '10', 10),
  importoQuotaAnnuale: parseInt(
    process.env.NEXT_PUBLIC_QUOTA_ANNUALE ?? '120',
    10,
  ),
  urlCampioncino: process.env.NEXT_PUBLIC_CAMPIONCINO ?? '',
  urlCampioncinoSmall: process.env.NEXT_PUBLIC_CAMPIONCINO_SMALL ?? '',
  locale: process.env.NEXT_PUBLIC_LOCALE ?? 'it-IT',
  bonusFattoreCasalingo: parseInt(
    process.env.NEXT_PUBLIC_FATTORE_CASALINGO ?? '0',
    10,
  ),
  bonusGol: parseFloat(process.env.NEXT_PUBLIC_BONUS_GOL ?? '3'),
  bonusAssist: parseFloat(process.env.NEXT_PUBLIC_BONUS_ASSIST ?? '1'),
  bonusGolSubito: parseFloat(process.env.NEXT_PUBLIC_BONUS_GOLSUBITO ?? '-1'),
  bonusAmmonizione: parseFloat(
    process.env.NEXT_PUBLIC_BONUS_AMMONIZIONE ?? '-0.5',
  ),
  bonusEspulsione: parseFloat(process.env.NEXT_PUBLIC_BONUS_ESPULSIONE ?? '-1'),
  bonusRigoreParato: parseFloat(
    process.env.NEXT_PUBLIC_BONUS_RIGOREPARATO ?? '3',
  ),
  bonusRigoreSbagliato: parseFloat(
    process.env.NEXT_PUBLIC_BONUS_RIGORESBAGLIATO ?? '-3',
  ),
  bonusAutogol: parseFloat(process.env.NEXT_PUBLIC_BONUS_AUTOGOL ?? '-2'),
  bonusSenzaVoto: parseFloat(process.env.NEXT_PUBLIC_BONUS_SENZA_VOTO ?? '0'),
  bonusModulo:
    process.env.NEXT_PUBLIC_BONUS_MODULO !== undefined &&
    process.env.NEXT_PUBLIC_BONUS_MODULO?.toLowerCase() === 'true',
  bonusModulo541: parseFloat(process.env.NEXT_PUBLIC_BONUS_MODULO_541 ?? '1.5'),
  bonusModulo451: parseFloat(process.env.NEXT_PUBLIC_BONUS_MODULO_451 ?? '1'),
  bonusModulo532: parseFloat(process.env.NEXT_PUBLIC_BONUS_MODULO_532 ?? '0.5'),
  bonusModulo442: parseFloat(process.env.NEXT_PUBLIC_BONUS_MODULO_442 ?? '0'),
  bonusModulo352: parseFloat(
    process.env.NEXT_PUBLIC_BONUS_MODULO_352 ?? '-0.5',
  ),
  bonusModulo433: parseFloat(process.env.NEXT_PUBLIC_BONUS_MODULO_433 ?? '-1'),
  bonusModulo343: parseFloat(
    process.env.NEXT_PUBLIC_BONUS_MODULO_343 ?? '-1.5',
  ),
  maxSostituzioni: parseInt(process.env.NEXT_PUBLIC_SOSTITUZIONI ?? '6'),
  pfColumns: parseInt(process.env.NEXT_PUBLIC_PF_COUNT ?? '35'),
  pfColumnIdGiocatore: parseInt(process.env.NEXT_PUBLIC_PF_IDGIOCATORE ?? '0'),
  pfColumnNome: parseInt(process.env.NEXT_PUBLIC_PF_NOME ?? '0'),
  pfColumnRuolo: parseInt(process.env.NEXT_PUBLIC_PF_RUOLO ?? '0'),
  pfColumnSquadra: parseInt(process.env.NEXT_PUBLIC_PF_SQUADRA ?? '0'),
  pfColumnVoto: parseInt(process.env.NEXT_PUBLIC_PF_VOTO ?? '0'),
  pfColumnAssist: parseInt(process.env.NEXT_PUBLIC_PF_ASSIST ?? '0'),
  pfColumnAmmo: parseInt(process.env.NEXT_PUBLIC_PF_AMMO ?? '0'),
  pfColumnEspu: parseInt(process.env.NEXT_PUBLIC_PF_ESPU ?? '0'),
  pfColumnGolFatti: parseInt(process.env.NEXT_PUBLIC_PF_GOLFATTI ?? '0'),
  pfColumnGolSubiti: parseInt(process.env.NEXT_PUBLIC_PF_GOLSUBITI ?? '0'),
  pfColumnRigErrato: parseInt(process.env.NEXT_PUBLIC_PF_RIGERRATO ?? '0'),
  pfColumnRigParato: parseInt(process.env.NEXT_PUBLIC_PF_RIGPARATO ?? '0'),
  pfColumnAutogol: parseInt(process.env.NEXT_PUBLIC_PF_AUTOGOL ?? '0'),
  dataGiornata1SerieA:
    new Date(process.env.NEXT_PUBLIC_DATA_GIORNATA_1_SERIEA!) ??
    new Date(),
  mercatoSettembre:
    new Date(process.env.NEXT_PUBLIC_DATA_MERCATO_SETTEMBRE!) ??
    new Date(),
}
