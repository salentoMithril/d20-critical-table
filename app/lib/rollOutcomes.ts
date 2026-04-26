// Mapping 1–20 → responso del lancio.
//
// Struttura in due tempi:
//   story    → cosa e' successo, in prima persona.
//   reaction → cosa hanno scritto gli altri (i tag del Reward Bible
//              vengono citati verbatim e ricevono enfasi tonale).
//
// Tono complessivo:
//   1     → unico vero fallimento, divertente.
//   2–10  → carini/neutri, mai cattivi col giocatore.
//   11–19 → positivi crescenti.
//   20    → successo critico.

export type TagTone = "pos" | "fun" | "neu" | "neg";

export type RollOutcomeFragment = {
  text: string;
  tone?: TagTone;
};

export type RollOutcome = {
  story: readonly RollOutcomeFragment[];
  reaction: readonly RollOutcomeFragment[];
};

const F = (text: string): RollOutcomeFragment => ({ text });
const T = (text: string, tone: TagTone): RollOutcomeFragment => ({ text, tone });

export const ROLL_OUTCOMES: Record<number, RollOutcome> = {
  1: {
    story: [
      F("Sono arrivato con due ore di ritardo senza chiamare nessuno, e a metà serata sono pure sparito senza salutare."),
    ],
    reaction: [
      F("Il giorno dopo accanto al mio nickname c'erano già due tag: «"),
      T("In ritardo senza avvisare", "neg"),
      F("» e «"),
      T("Ha saltato senza dirlo", "neg"),
      F("». Onestamente, non posso nemmeno protestare."),
    ],
  },
  2: {
    story: [
      F("Ho fatto qualche errore facile e ho dovuto rileggere due volte la stessa carta. Ma la partita l'ho chiusa in piedi."),
    ],
    reaction: [
      F("Tra i feedback mi è arrivato un onesto «"),
      T("Ancora in rodaggio", "neu"),
      F("». Non lo prendo come offesa: è anche la verità."),
    ],
  },
  3: {
    story: [
      F("Ho perso la partita, ma due mosse mi sono uscite davvero bene. Si vedeva che ci stavo provando."),
    ],
    reaction: [
      F("A fine serata mi hanno scritto «"),
      T("Ottimo potenziale", "neu"),
      F("». Tradotto: la prossima volta tocca a me."),
    ],
  },
  4: {
    story: [
      F("Ho imparato il regolamento partita dopo partita. Verso la fine stavo già correggendo gli errori altrui — con garbo, eh."),
    ],
    reaction: [
      F("Hanno chiuso il feedback con «"),
      T("Impara veloce", "neu"),
      F("». Tre partite e parlavo già la lingua del tavolo."),
    ],
  },
  5: {
    story: [
      F("Una mossa azzardata mi è uscita bene e da lì la partita ha preso una piega che non mi aspettavo nemmeno io."),
    ],
    reaction: [
      F("Uno del tavolo mi ha messo «"),
      T("Prima volta che lo vedo giocare bene", "neu"),
      F("». Tecnicamente ha ragione, ma fingiamo di niente."),
    ],
  },
  6: {
    story: [
      F("Mi sono fermato a fare due chiacchiere con tutti, anche con quelli più silenziosi nell'angolo, e ho memorizzato i loro nickname."),
    ],
    reaction: [
      F("Il commento più carino è stato «"),
      T("Si è ricordato del mio nickname", "fun"),
      F("». Piccola cosa, a quanto pare conta."),
    ],
  },
  7: {
    story: [
      F("Ho perso una partita che avevo in mano. Ho stretto la mano all'avversario, fatto i complimenti per la mossa che mi ha steso, e me ne sono andato col sorriso."),
    ],
    reaction: [
      F("Mi hanno taggato «"),
      T("Sa perdere con stile", "pos"),
      F("». Un bel modo di dire «almeno non hai fatto scenate»."),
    ],
  },
  8: {
    story: [
      F("Ho tenuto le carte sul tavolo, rispettato i tempi e applicato le regole senza interpretazioni creative — anche quando facevano comodo a me."),
    ],
    reaction: [
      F("Il feedback è arrivato secco: «"),
      T("Gioco pulito", "pos"),
      F("». Non è poesia, ma è quello che mi piace sentirmi dire."),
    ],
  },
  9: {
    story: [
      F("Ho riso alle battute degli altri, passato le carte senza piagnucolare e tenuto il mio peggior umore lontano dal tavolo."),
    ],
    reaction: [
      F("Hanno chiuso con un «"),
      T("Ottimo compagno di tavolo", "pos"),
      F("». Tradotto: non hai rovinato la serata. Ce la posso fare."),
    ],
  },
  10: {
    story: [
      F("Sono passato dal supermercato prima di entrare e ho riempito il tavolo di patatine, salatini e bibite per tutti."),
    ],
    reaction: [
      F("Mi hanno taggato in massa «"),
      T("Ha portato gli snack", "fun"),
      F("». Il mio contributo strategico più efficace di sempre."),
    ],
  },
  11: {
    story: [
      F("Una battuta al momento giusto e il tavolo è ripartito ridendo proprio quando la tensione iniziava a salire."),
    ],
    reaction: [
      F("Mi hanno scritto «"),
      T("Ha fatto scherzi nei momenti giusti", "fun"),
      F("». Mi viene così, giuro — non mi alleno."),
    ],
  },
  12: {
    story: [
      F("Al tavolo c'erano due nuovi che si vergognavano a chiedere. Mi sono fermato dieci minuti su ogni dubbio finché non hanno detto «ok, andiamo»."),
    ],
    reaction: [
      F("Mi hanno taggato «"),
      T("Spiega senza fare il maestrino", "pos"),
      F("» e «"),
      T("Sempre disposto a spiegare", "pos"),
      F("». La seconda mi piace ancora di più."),
    ],
  },
  13: {
    story: [
      F("Ho chiuso la partita con una mossa pulita, ho stretto le mani e siamo usciti tutti insieme a bere qualcosa. Niente ego, niente bandiere sul tavolo."),
    ],
    reaction: [
      F("Sui feedback è arrivato «"),
      T("Sa vincere senza esultare in faccia", "pos"),
      F("» e «"),
      T("Zero comportamenti tossici", "pos"),
      F("». Bel paio, secondo me."),
    ],
  },
  14: {
    story: [
      F("Ho ordinato quattro pizze, portato pure le birre, e per due ore il tavolo si è scordato dei dadi. Si rideva come al ristorante, non come a un torneo."),
    ],
    reaction: [
      F("I tag erano già pronti: «"),
      T("Ha portato LA pizza", "fun"),
      F("» e «"),
      T("Atmosfera fantastica", "fun"),
      F("». Almeno il 30% del merito era del cartone unto."),
    ],
  },
  15: {
    story: [
      F("Ho aperto io la sala, sistemato i tavoli, e quando è iniziata la prima partita conoscevo già tutte le eccezioni del regolamento. Al paragrafo 7.3 ho risposto a memoria."),
    ],
    reaction: [
      F("Mi hanno taggato «"),
      T("Puntuale come un orologio", "pos"),
      F("» e «"),
      T("Conosce le regole a memoria", "pos"),
      F("». Sì, sono quel tipo lì. No, non chiedo scusa."),
    ],
  },
  16: {
    story: [
      F("Avevo due novellini nel mio tavolo, terrorizzati di sbagliare. Tre ore dopo giocavano da soli, ridevano e mi chiedevano quando si rifaceva."),
    ],
    reaction: [
      F("Hanno chiuso con «"),
      T("Superpaziente coi novellini", "pos"),
      F("» e «"),
      T("Non ci pensa due volte a insegnare", "pos"),
      F("». Il mio sport preferito, premiato."),
    ],
  },
  17: {
    story: [
      F("Ho smontato la strategia avversaria in tre turni, poi ho offerto il caffè e abbiamo riso mezz'ora di una mossa assurda fatta al turno cinque."),
    ],
    reaction: [
      F("Tra i tag mi sono arrivati «"),
      T("Ti distrugge ma ci ridi su", "fun"),
      F("» e «"),
      T("Il tavolo più divertente della serata", "fun"),
      F("». Entrambi da incorniciare."),
    ],
  },
  18: {
    story: [
      F("Ho organizzato io tutto: la sala, la playlist, le birre, persino i fogli per i punteggi. A fine serata stavano già chiedendo quando si rifà."),
    ],
    reaction: [
      F("I commenti più ricorrenti: «"),
      T("Ha organizzato tutto alla grande", "fun"),
      F("» e «"),
      T("Mi ha fatto venir voglia di tornare", "fun"),
      F("». Forse anche un po' troppa voglia."),
    ],
  },
  19: {
    story: [
      F("Ho fatto sedere allo stesso tavolo gente che non si era mai parlata e ho tirato fuori due aneddoti che non c'entravano nulla. Adesso si scrivono."),
    ],
    reaction: [
      F("Sui feedback è arrivato «"),
      T("Ha fatto conoscere gente nuova", "fun"),
      F("» e «"),
      T("Narratore nato", "fun"),
      F("». Me li godo entrambi."),
    ],
  },
  20: {
    story: [
      F("Critico al primo turno, decisione folle che paga, applausi al tavolo. Una di quelle serate che racconti per anni — e questa volta sono io quello dell'aneddoto."),
    ],
    reaction: [
      F("I tag sono arrivati gemelli: «"),
      T("Serata indimenticabile", "fun"),
      F("» e «"),
      T("Il momento epico della serata era suo", "fun"),
      F("». Li tengo incorniciati."),
    ],
  },
};

export function outcomeFor(value: number): RollOutcome | null {
  return ROLL_OUTCOMES[value] ?? null;
}
