import type { Locale } from '../types'

export interface Translations {
  langName: string
  langShort: string
  nav: {
    brandSub: string
    statusOpen: string
    statusLocked: string
    statusCompleted: string
    share: string
    copied: string
    admin: string
    joinCta: string
  }
  hero: {
    eyebrow: string
    titlePrefix: string
    titleHighlight: string
    subtitle: string
    receiptTitle: string
    receiptBadge: string
    printerRetailLabel: string
    discountLabel: string
    printerNetLabel: string
    filamentLabel: string
    perKilo: string
    spoolsWord: string
    spoolWord: string
    extraCostFallback: string
    totalGoalLabel: string
    equalSplitExplain: string
    liveSplitCardTitle: string
    peopleInPoolNow: string
    currentShareEach: string
    ifYouJoinNow: string
    withYouCount: string
    personSingular: string
    peoplePlural: string
    extraBoostCollected: string
    extraBoostHint: string
    topColorsRackTitle: string
    spoolSlotLabel: string
    votesCount: string
    voteSingular: string
    pinnedTag: string
    simulatorTitle: string
    simulatorSub: string
    simulatorPerPerson: string
  }
  join: {
    sectionEyebrow: string
    title: string
    subtitle: string
    lockedBannerTitle: string
    lockedBannerDesc: string
    completedBannerTitle: string
    completedBannerDesc: string
    formulaLabel: string
    formulaTotal: string
    formulaDividedBy: string
    formulaMinimum: string
    nameLabel: string
    namePlaceholder: string
    amountLabel: string
    minRuleNotice: string
    quickExactMin: string
    quickRoundUp: string
    errorBelowMin: string
    resetToMin: string
    errorNameRequired: string
    modeTitle: string
    modeDynamicLabel: string
    modeDynamicDesc: string
    modeFixedLabel: string
    modeFixedDesc: string
    exactMinFeedback: string
    colorVoteLabel: string
    colorVoteHint: string
    noteLabel: string
    notePlaceholder: string
    submitBtn: string
    submittingBtn: string
    joinedBadge: string
    joinedTitle: string
    joinedSubtitle: string
    yourCurrentTotal: string
    yourBaseShare: string
    yourExtraBoost: string
    paidConfirmed: string
    awaitingSettlement: string
    editMyEntryBtn: string
    saveChangesBtn: string
    cancelEditBtn: string
    addAnotherPersonBtn: string
    backToMyEntryBtn: string
    paymentTitle: string
    paymentBeneficiary: string
    paymentIban: string
    copyIban: string
    ibanCopied: string
    openPaymentLink: string
    updatedToast: string
    joinedToast: string
  }
  colors: {
    eyebrow: string
    title: string
    subtitle: string
    leadingBadge: string
    pinnedBadge: string
    voteBtn: string
    votedBtn: string
    preselectedBtn: string
    savingVotes: string
    votesSavedToast: string
    selectBeforeJoinHint: string
    maxVotesReachedHint: string
    votersLabel: string
    noVotesYet: string
  }
  ledger: {
    eyebrow: string
    title: string
    subtitle: string
    organizerBadge: string
    youBadge: string
    paidBadge: string
    equalShareTag: string
    boostTag: string
    fixedPledgeTag: string
    emptyState: string
    howItWorksTitle: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
  }
  footer: {
    madeFor: string
    liveSync: string
    offlineMode: string
    adminAccess: string
  }
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    langName: 'English',
    langShort: 'EN',
    nav: {
      brandSub: 'Group Crowdfunding',
      statusOpen: 'Open to Join',
      statusLocked: 'Pool Locked · Time to Settle',
      statusCompleted: 'Funded & Ordered!',
      share: 'Share Link',
      copied: 'Link Copied!',
      admin: 'Admin',
      joinCta: 'Join Pool',
    },
    hero: {
      eyebrow: '€120 Discount Unlocked · Group Split',
      titlePrefix: 'Chipping in together for a',
      titleHighlight: 'Bambu Lab A1 mini 3D Printer + Filament',
      subtitle:
        'I got a €120 discount on the €179 Bambu Lab A1 mini 3D Printer — bringing it down to €59, plus Bambu Lab filament spools! Everyone who joins splits the total equally (or adds a little extra if they want). The more of us join, the less everyone pays.',
      receiptTitle: 'Transparent Cost Breakdown',
      receiptBadge: '100% Shared Equally',
      printerRetailLabel: 'Retail price',
      discountLabel: 'Discount voucher applied',
      printerNetLabel: 'Net printer price',
      filamentLabel: 'Filament',
      perKilo: '/ kg',
      spoolsWord: 'spools',
      spoolWord: 'spool',
      extraCostFallback: 'Additional supplies',
      totalGoalLabel: 'Total to split',
      equalSplitExplain: 'Every participant pays at least Total ÷ Total People — never less, optionally more.',
      liveSplitCardTitle: 'Live Group Split',
      peopleInPoolNow: 'Currently in pool',
      currentShareEach: 'Current equal share',
      ifYouJoinNow: 'Minimum if you join now',
      withYouCount: 'with you included',
      personSingular: 'person',
      peoplePlural: 'people',
      extraBoostCollected: 'Extra community boost',
      extraBoostHint: 'Extra € above the equal split goes toward extra filament!',
      topColorsRackTitle: 'Leading Filament Spools',
      spoolSlotLabel: 'Spool',
      votesCount: 'votes',
      voteSingular: 'vote',
      pinnedTag: 'Pinned',
      simulatorTitle: 'Price-Drop Calculator',
      simulatorSub: 'Slide to see how everyone’s equal share drops as more people join:',
      simulatorPerPerson: 'per person',
    },
    join: {
      sectionEyebrow: 'Participate',
      title: 'Join the Crowdfunding',
      subtitle: 'Enter your name, customize your amount (at or above the equal share), and vote for your favorite filament colors.',
      lockedBannerTitle: 'The participant pool is now locked!',
      lockedBannerDesc: 'Everyone’s final share is calculated below so we can settle up and place the order.',
      completedBannerTitle: 'Goal completed — thank you everyone!',
      completedBannerDesc: 'This group fund is complete. Check the final breakdown and winning filament colors below!',
      formulaLabel: 'Live Minimum Calculation (with you)',
      formulaTotal: 'Total Goal',
      formulaDividedBy: 'People',
      formulaMinimum: 'Minimum Share',
      nameLabel: 'Your Name',
      namePlaceholder: 'e.g. Mama, Lucas, Sofie...',
      amountLabel: 'Your Contribution (€)',
      minRuleNotice: 'Minimum allowed is Total ÷ Total People',
      quickExactMin: 'Exact Share',
      quickRoundUp: 'Round up',
      errorBelowMin: 'Cannot be less than Total ÷ Total People ({min}). You can only send the equal share or more.',
      resetToMin: 'Set to minimum ({min})',
      errorNameRequired: 'Please enter your name so we know who joined!',
      modeTitle: 'How should your extra +{extra} work as more people join?',
      modeDynamicLabel: 'Keep +{extra} boost on top of live equal share',
      modeDynamicDesc: 'As more people join, your base share still drops automatically while keeping your +{extra} extra.',
      modeFixedLabel: 'Lock my total at {total}',
      modeFixedDesc: 'Your pledge stays {total} even as more people join (always at least the equal share).',
      exactMinFeedback: 'Exact equal split! As more people join after you, your share automatically drops too.',
      colorVoteLabel: 'Vote for Filament Colors (up to {max})',
      colorVoteHint: 'Optional — help pick which colors we buy first!',
      noteLabel: 'Short Message (Optional)',
      notePlaceholder: 'Happy to chip in! 🎉',
      submitBtn: 'Join & Confirm My Share',
      submittingBtn: 'Joining...',
      joinedBadge: 'You’re in the pool!',
      joinedTitle: 'Thanks for joining, {name}!',
      joinedSubtitle: 'Your share updates live whenever someone new joins the group.',
      yourCurrentTotal: 'Your live contribution',
      yourBaseShare: 'Equal split ({people} people)',
      yourExtraBoost: 'Your extra boost',
      paidConfirmed: 'Marked as Paid — thank you!',
      awaitingSettlement: 'Live estimate — drops further as more join',
      editMyEntryBtn: 'Customize Amount / Colors',
      saveChangesBtn: 'Save Changes',
      cancelEditBtn: 'Cancel',
      addAnotherPersonBtn: 'Add another family member on this device',
      backToMyEntryBtn: 'Back to my participation',
      paymentTitle: 'How to Send Your Contribution',
      paymentBeneficiary: 'Beneficiary',
      paymentIban: 'IBAN',
      copyIban: 'Copy IBAN',
      ibanCopied: 'Copied!',
      openPaymentLink: 'Pay Now',
      updatedToast: 'Your participation has been updated!',
      joinedToast: 'Welcome aboard! You are officially in the pool.',
    },
    colors: {
      eyebrow: 'Color Poll',
      title: 'Vote on the Filament Colors',
      subtitle: 'We’re getting {spools} × 1 kg Bambu Lab filament spools ({price}/kg). Vote for up to {max} official colors!',
      leadingBadge: 'Top #{rank} Spool',
      pinnedBadge: 'Selected',
      voteBtn: 'Vote',
      votedBtn: 'Voted',
      preselectedBtn: 'Picked',
      savingVotes: 'Saving vote...',
      votesSavedToast: 'Color votes updated!',
      selectBeforeJoinHint: 'Pick up to {max} colors here — they’ll be included automatically when you join!',
      maxVotesReachedHint: 'You already picked {max} colors — tap a selected color to swap it.',
      votersLabel: 'Voted by:',
      noVotesYet: 'No votes yet — be the first!',
    },
    ledger: {
      eyebrow: 'Transparency',
      title: 'Who’s In the Pool',
      subtitle: 'Live breakdown of everyone splitting the cost right now.',
      organizerBadge: 'Organizer',
      youBadge: 'You',
      paidBadge: 'Paid',
      equalShareTag: 'Equal share',
      boostTag: 'extra boost',
      fixedPledgeTag: 'Locked pledge',
      emptyState: 'Be the very first person to join {organizer} in splitting the Bambu Lab A1 mini!',
      howItWorksTitle: 'How the Fair Split Works',
      step1Title: '1. Total ÷ Total People',
      step1Desc: 'The base price (printer after €120 discount + filament spools) is divided equally by everyone in the group.',
      step2Title: '2. Customize Upward Only',
      step2Desc: 'Everyone contributes at least the equal share — never less. If you want, you can add a little extra on top!',
      step3Title: '3. Cheaper as More Join',
      step3Desc: 'Every new family member or friend who joins lowers the equal base share for everyone in real time.',
    },
    footer: {
      madeFor: 'Organized by {organizer} · 100% transparent group split',
      liveSync: 'Live Realtime Sync',
      offlineMode: 'Preview Mode',
      adminAccess: 'Admin Panel',
    },
  },

  nl: {
    langName: 'Nederlands',
    langShort: 'NL',
    nav: {
      brandSub: 'Groepspot · 3D-Printer',
      statusOpen: 'Open om mee te doen',
      statusLocked: 'Groep gesloten · Afrekenen',
      statusCompleted: 'Compleet & Besteld!',
      share: 'Deel link',
      copied: 'Link gekopieerd!',
      admin: 'Admin',
      joinCta: 'Doe mee',
    },
    hero: {
      eyebrow: '€120 Korting · Eerlijke Groepsverdeling',
      titlePrefix: 'Samen leggen voor een',
      titleHighlight: 'Bambu Lab A1 mini 3D Printer + Filament',
      subtitle:
        'Ik heb €120 korting op de Bambu Lab A1 mini 3D Printer van €179 — waardoor hij maar €59 kost, plus Bambu Lab-filamentrollen! Iedereen die meedoet deelt het totaalbedrag eerlijk (of legt vrijblijvend iets extra bij). Hoe meer mensen meedoen, hoe goedkoper voor iedereen.',
      receiptTitle: 'Transparante Prijsopbouw',
      receiptBadge: '100% Eerlijk Gedeeld',
      printerRetailLabel: 'Normale prijs',
      discountLabel: 'Korting toegepast',
      printerNetLabel: 'Netto printerprijs',
      filamentLabel: 'Filament',
      perKilo: '/ kg',
      spoolsWord: 'rollen',
      spoolWord: 'rol',
      extraCostFallback: 'Extra benodigdheden',
      totalGoalLabel: 'Totaal te verdelen',
      equalSplitExplain: 'Iedere deelnemer betaalt minstens Totaal ÷ Aantal Personen — nooit minder, eventueel meer.',
      liveSplitCardTitle: 'Live Verdeling',
      peopleInPoolNow: 'Nu in de groep',
      currentShareEach: 'Huidige gelijke bijdrage',
      ifYouJoinNow: 'Minimum als jij nu meedoet',
      withYouCount: 'inclusief jou',
      personSingular: 'persoon',
      peoplePlural: 'personen',
      extraBoostCollected: 'Extra bijgelegd',
      extraBoostHint: 'Extra € boven het gelijke deel gaat naar extra filament!',
      topColorsRackTitle: 'Populairste Filamentkleuren',
      spoolSlotLabel: 'Rol',
      votesCount: 'stemmen',
      voteSingular: 'stem',
      pinnedTag: 'Vastgezet',
      simulatorTitle: 'Bereken wat iedereen betaalt',
      simulatorSub: 'Schuif om te zien hoe het bedrag per persoon daalt als er meer mensen meedoen:',
      simulatorPerPerson: 'per persoon',
    },
    join: {
      sectionEyebrow: 'Meedoen',
      title: 'Doe mee met de Crowdfunding',
      subtitle: 'Vul je naam in, kies je bedrag (minstens het gelijke deel, of meer) en stem op je favoriete filamentkleuren.',
      lockedBannerTitle: 'De deelnemersgroep staat nu vast!',
      lockedBannerDesc: 'Ieders definitieve bijdrage staat hieronder berekend zodat we kunnen afrekenen.',
      completedBannerTitle: 'Doel bereikt — bedankt allemaal!',
      completedBannerDesc: 'Deze groepsaankoop is compleet. Bekijk het eindoverzicht en de gekozen kleuren hieronder!',
      formulaLabel: 'Live Minimumberekening (met jou erbij)',
      formulaTotal: 'Totaalbedrag',
      formulaDividedBy: 'Personen',
      formulaMinimum: 'Minimumdeel',
      nameLabel: 'Jouw Naam',
      namePlaceholder: 'bv. Mama, Papa, Lucas, Sofie...',
      amountLabel: 'Jouw Bijdrage (€)',
      minRuleNotice: 'Minimum is Totaal ÷ Totaal Personen',
      quickExactMin: 'Gelijk deel',
      quickRoundUp: 'Afronden',
      errorBelowMin: 'Kan niet lager zijn dan Totaal ÷ Aantal Personen ({min}). Enkel het gelijke deel of meer is mogelijk.',
      resetToMin: 'Zet op minimum ({min})',
      errorNameRequired: 'Vul alsjeblieft je naam in zodat we weten wie er meedoet!',
      modeTitle: 'Hoe moet jouw extra +{extra} werken als er meer mensen bijkomen?',
      modeDynamicLabel: 'Houd +{extra} extra bovenop het live gelijke deel',
      modeDynamicDesc: 'Als er meer mensen meedoen, daalt je basisdeel automatisch mee en blijft je +{extra} extra behouden.',
      modeFixedLabel: 'Zet mijn totaal vast op {total}',
      modeFixedDesc: 'Jouw bijdrage blijft {total}, ook als er meer mensen bijkomen (altijd minstens het gelijke deel).',
      exactMinFeedback: 'Precies het gelijke deel! Zodra er nog meer mensen meedoen, zakt jouw bedrag automatisch mee.',
      colorVoteLabel: 'Stem op Filamentkleuren (max. {max})',
      colorVoteHint: 'Optioneel — help kiezen welke kleuren we bestellen!',
      noteLabel: 'Kort Berichtje (Optioneel)',
      notePlaceholder: 'Leuk idee, ik doe mee! 🎉',
      submitBtn: 'Meedoen & Bijdrage Bevestigen',
      submittingBtn: 'Bezig met toevoegen...',
      joinedBadge: 'Je doet mee!',
      joinedTitle: 'Bedankt om mee te doen, {name}!',
      joinedSubtitle: 'Je bijdrage past zich live aan zodra er nog iemand aansluit.',
      yourCurrentTotal: 'Jouw huidige bijdrage',
      yourBaseShare: 'Gelijk deel ({people} personen)',
      yourExtraBoost: 'Jouw extra bijdrage',
      paidConfirmed: 'Gemarkeerd als Betaald — dankjewel!',
      awaitingSettlement: 'Live tussenstand — daalt nog als meer mensen meedoen',
      editMyEntryBtn: 'Bedrag / Kleuren aanpassen',
      saveChangesBtn: 'Wijzigingen opslaan',
      cancelEditBtn: 'Annuleren',
      addAnotherPersonBtn: 'Nog een familielid toevoegen op dit toestel',
      backToMyEntryBtn: 'Terug naar mijn deelname',
      paymentTitle: 'Hoe je bijdrage overmaken',
      paymentBeneficiary: 'Begunstigde',
      paymentIban: 'IBAN-rekening',
      copyIban: 'Kopieer IBAN',
      ibanCopied: 'Gekopieerd!',
      openPaymentLink: 'Nu betalen',
      updatedToast: 'Je deelname is bijgewerkt!',
      joinedToast: 'Super! Je zit officieel in de groep.',
    },
    colors: {
      eyebrow: 'Kleurenstemming',
      title: 'Kies mee de Filamentkleuren',
      subtitle: 'We nemen {spools} × 1 kg Bambu Lab-filamentrollen ({price}/kg). Stem op maximaal {max} officiële kleuren!',
      leadingBadge: 'Top #{rank} Rol',
      pinnedBadge: 'Gekozen',
      voteBtn: 'Stem',
      votedBtn: 'Gestemd',
      preselectedBtn: 'Gekozen',
      savingVotes: 'Stem opslaan...',
      votesSavedToast: 'Kleurenstem bijgewerkt!',
      selectBeforeJoinHint: 'Kies hier tot {max} kleuren — ze worden meteen meegenomen zodra je meedoet!',
      maxVotesReachedHint: 'Je hebt al {max} kleuren gekozen — tik op een gekozen kleur om te wisselen.',
      votersLabel: 'Gestemd door:',
      noVotesYet: 'Nog geen stemmen — stem als eerste!',
    },
    ledger: {
      eyebrow: 'Overzicht',
      title: 'Wie doet er mee?',
      subtitle: 'Live overzicht van iedereen die mee de kosten deelt.',
      organizerBadge: 'Organisator',
      youBadge: 'Jij',
      paidBadge: 'Betaald',
      equalShareTag: 'Gelijk deel',
      boostTag: 'extra bijgelegd',
      fixedPledgeTag: 'Vast bedrag',
      emptyState: 'Wees de allereerste om samen met {organizer} mee te doen!',
      howItWorksTitle: 'Hoe werkt de verdeling?',
      step1Title: '1. Totaal ÷ Aantal Personen',
      step1Desc: 'De totaalprijs (printer na €120 korting + filamentrollen) wordt gelijk verdeeld onder iedereen die meedoet.',
      step2Title: '2. Enkel Gelijk of Meer',
      step2Desc: 'Iedereen betaalt minstens het gelijke deel — nooit minder. Wie wil, kan het bedrag naar boven aanpassen.',
      step3Title: '3. Goedkoper met meer mensen',
      step3Desc: 'Bij elk nieuw familielid of vriend die aansluit, zakt het gelijke basisbedrag live voor iedereen.',
    },
    footer: {
      madeFor: 'Georganiseerd door {organizer} · 100% transparante groepsverdeling',
      liveSync: 'Live Verbonden',
      offlineMode: 'Preview Modus',
      adminAccess: 'Adminpaneel',
    },
  },

  fr: {
    langName: 'Français',
    langShort: 'FR',
    nav: {
      brandSub: 'Cagnotte Groupée · 3D',
      statusOpen: 'Ouvert aux participants',
      statusLocked: 'Groupe clôturé · Règlement',
      statusCompleted: 'Financé & Commandé !',
      share: 'Partager',
      copied: 'Lien copié !',
      admin: 'Admin',
      joinCta: 'Participer',
    },
    hero: {
      eyebrow: '120 € de Réduction · Partage Équitable',
      titlePrefix: 'On cotise ensemble pour une',
      titleHighlight: 'Bambu Lab A1 mini 3D Printer + Filament',
      subtitle:
        'J’ai obtenu 120 € de réduction sur la Bambu Lab A1 mini 3D Printer à 179 € — ce qui la ramène à 59 €, plus les bobines de filament Bambu Lab ! Tous les participants partagent le total à parts égales (ou donnent un petit plus s’ils le souhaitent). Plus on est nombreux, moins chacun paie.',
      receiptTitle: 'Détail Transparent du Prix',
      receiptBadge: '100% Partagé Équitablement',
      printerRetailLabel: 'Prix initial',
      discountLabel: 'Réduction appliquée',
      printerNetLabel: 'Prix net imprimante',
      filamentLabel: 'Filament',
      perKilo: '/ kg',
      spoolsWord: 'bobines',
      spoolWord: 'bobine',
      extraCostFallback: 'Frais supplémentaires',
      totalGoalLabel: 'Total à partager',
      equalSplitExplain: 'Chaque participant paie au minimum Total ÷ Nombre de personnes — jamais moins, éventuellement plus.',
      liveSplitCardTitle: 'Partage en Direct',
      peopleInPoolNow: 'Participants actuels',
      currentShareEach: 'Part égale actuelle',
      ifYouJoinNow: 'Minimum si vous rejoignez',
      withYouCount: 'vous inclus',
      personSingular: 'personne',
      peoplePlural: 'personnes',
      extraBoostCollected: 'Bonus supplémentaire',
      extraBoostHint: 'Les € en plus financent du filament supplémentaire !',
      topColorsRackTitle: 'Bobines en Tête des Votes',
      spoolSlotLabel: 'Bobine',
      votesCount: 'votes',
      voteSingular: 'vote',
      pinnedTag: 'Sélectionné',
      simulatorTitle: 'Simulateur de Part par Personne',
      simulatorSub: 'Faites glisser pour voir comment la part baisse quand plus de proches rejoignent :',
      simulatorPerPerson: 'par personne',
    },
    join: {
      sectionEyebrow: 'Participer',
      title: 'Rejoindre la Cagnotte',
      subtitle: 'Indiquez votre prénom, personnalisez votre montant (égal ou supérieur à la part minimale) et votez pour les couleurs.',
      lockedBannerTitle: 'Les inscriptions sont clôturées !',
      lockedBannerDesc: 'La part finale de chacun est affichée ci-dessous pour passer au règlement.',
      completedBannerTitle: 'Objectif atteint — merci à tous !',
      completedBannerDesc: 'Cette cagnotte est terminée. Découvrez le récapitulatif et les couleurs choisies ci-dessous !',
      formulaLabel: 'Calcul du Minimum en Direct (avec vous)',
      formulaTotal: 'Total',
      formulaDividedBy: 'Personnes',
      formulaMinimum: 'Part Minimale',
      nameLabel: 'Votre Prénom / Nom',
      namePlaceholder: 'ex. Maman, Papa, Lucas, Sofie...',
      amountLabel: 'Votre Participation (€)',
      minRuleNotice: 'Le minimum autorisé est Total ÷ Nombre de personnes',
      quickExactMin: 'Part exacte',
      quickRoundUp: 'Arrondir',
      errorBelowMin: 'Impossible de mettre moins que Total ÷ Nombre de personnes ({min}). Seulement la part égale ou plus.',
      resetToMin: 'Mettre au minimum ({min})',
      errorNameRequired: 'Merci d’indiquer votre prénom pour rejoindre le groupe !',
      modeTitle: 'Comment gérer votre bonus de +{extra} si d’autres personnes rejoignent ?',
      modeDynamicLabel: 'Garder +{extra} de bonus en plus de la part égale',
      modeDynamicDesc: 'Quand d’autres rejoignent, votre part de base baisse automatiquement tout en gardant votre +{extra}.',
      modeFixedLabel: 'Fixer mon total à {total}',
      modeFixedDesc: 'Votre participation reste fixée à {total} même si d’autres rejoignent (toujours ≥ part égale).',
      exactMinFeedback: 'Part égale exacte ! Si d’autres personnes rejoignent après vous, votre part baissera automatiquement.',
      colorVoteLabel: 'Votez pour les Couleurs de Filament (max. {max})',
      colorVoteHint: 'Optionnel — aidez à choisir les couleurs des bobines !',
      noteLabel: 'Petit Mot (Optionnel)',
      notePlaceholder: 'Avec plaisir, super projet ! 🎉',
      submitBtn: 'Rejoindre & Confirmer ma Part',
      submittingBtn: 'Enregistrement...',
      joinedBadge: 'Vous participez !',
      joinedTitle: 'Merci pour votre participation, {name} !',
      joinedSubtitle: 'Votre part se met à jour en direct à chaque nouveau participant.',
      yourCurrentTotal: 'Votre participation actuelle',
      yourBaseShare: 'Part égale ({people} personnes)',
      yourExtraBoost: 'Votre coup de pouce',
      paidConfirmed: 'Marqué comme Payé — merci !',
      awaitingSettlement: 'Estimation en direct — baisse encore si d’autres rejoignent',
      editMyEntryBtn: 'Modifier montant / couleurs',
      saveChangesBtn: 'Enregistrer',
      cancelEditBtn: 'Annuler',
      addAnotherPersonBtn: 'Ajouter un autre proche sur cet appareil',
      backToMyEntryBtn: 'Retour à ma participation',
      paymentTitle: 'Comment régler votre part',
      paymentBeneficiary: 'Bénéficiaire',
      paymentIban: 'IBAN',
      copyIban: 'Copier l’IBAN',
      ibanCopied: 'Copié !',
      openPaymentLink: 'Payer maintenant',
      updatedToast: 'Votre participation a bien été mise à jour !',
      joinedToast: 'Bienvenue ! Vous faites officiellement partie de la cagnotte.',
    },
    colors: {
      eyebrow: 'Vote des Couleurs',
      title: 'Choisissez les Couleurs de Filament',
      subtitle: 'Nous prenons {spools} bobines Bambu Lab de 1 kg ({price}/kg). Votez pour {max} couleurs officielles maximum !',
      leadingBadge: 'Top #{rank}',
      pinnedBadge: 'Retenu',
      voteBtn: 'Voter',
      votedBtn: 'Voté',
      preselectedBtn: 'Choisi',
      savingVotes: 'Sauvegarde...',
      votesSavedToast: 'Votes enregistrés !',
      selectBeforeJoinHint: 'Choisissez jusqu’à {max} couleurs ici — elles seront validées lors de votre inscription !',
      maxVotesReachedHint: 'Vous avez déjà choisi {max} couleurs — cliquez sur une couleur choisie pour changer.',
      votersLabel: 'Voté par :',
      noVotesYet: 'Aucun vote pour l’instant — soyez le premier !',
    },
    ledger: {
      eyebrow: 'Transparence',
      title: 'Qui Participe ?',
      subtitle: 'Répartition en temps réel entre tous les participants.',
      organizerBadge: 'Organisateur',
      youBadge: 'Vous',
      paidBadge: 'Payé',
      equalShareTag: 'Part égale',
      boostTag: 'de bonus',
      fixedPledgeTag: 'Montant fixe',
      emptyState: 'Soyez la première personne à rejoindre {organizer} pour partager la Bambu Lab A1 mini !',
      howItWorksTitle: 'Comment fonctionne le partage ?',
      step1Title: '1. Total ÷ Nombre de personnes',
      step1Desc: 'Le total (imprimante après 120 € de remise + bobines de filament) est divisé équitablement entre tous.',
      step2Title: '2. Égal ou supérieur uniquement',
      step2Desc: 'Chacun paie au moins la part égale — jamais moins. Vous pouvez librement ajouter un petit plus.',
      step3Title: '3. Moins cher à plusieurs',
      step3Desc: 'Chaque nouveau membre de la famille ou ami qui rejoint fait baisser la part de base pour tout le monde.',
    },
    footer: {
      madeFor: 'Organisé par {organizer} · Partage 100% transparent',
      liveSync: 'Synchronisé en direct',
      offlineMode: 'Mode Aperçu',
      adminAccess: 'Espace Admin',
    },
  },

  es: {
    langName: 'Español',
    langShort: 'ES',
    nav: {
      brandSub: 'Compra Conjunta · 3D',
      statusOpen: 'Abierto para unirse',
      statusLocked: 'Grupo cerrado · A pagar',
      statusCompleted: '¡Financiado y Pedido!',
      share: 'Compartir',
      copied: '¡Enlace copiado!',
      admin: 'Admin',
      joinCta: 'Participar',
    },
    hero: {
      eyebrow: '120 € de Descuento · Reparto Equitativo',
      titlePrefix: 'Compramos entre todos una',
      titleHighlight: 'Bambu Lab A1 mini 3D Printer + Filamento',
      subtitle:
        '¡Conseguí 120 € de descuento en la Bambu Lab A1 mini 3D Printer de 179 €, así que se queda en solo 59 € más las bobinas de filamento Bambu Lab! El total se divide a partes iguales entre quienes nos apuntemos (o puedes aportar un extra si quieres). Cuantos más seamos, menos toca por persona.',
      receiptTitle: 'Desglose Transparente del Precio',
      receiptBadge: '100% Reparto Justo',
      printerRetailLabel: 'Precio original',
      discountLabel: 'Descuento aplicado',
      printerNetLabel: 'Precio neto impresora',
      filamentLabel: 'Filamento',
      perKilo: '/ kg',
      spoolsWord: 'bobinas',
      spoolWord: 'bobina',
      extraCostFallback: 'Extras adicionales',
      totalGoalLabel: 'Total a repartir',
      equalSplitExplain: 'Cada participante aporta como mínimo Total ÷ Total de Personas — nunca menos, opcionalmente más.',
      liveSplitCardTitle: 'Reparto en Vivo',
      peopleInPoolNow: 'Personas ahora mismo',
      currentShareEach: 'Parte igual actual',
      ifYouJoinNow: 'Mínimo si te unes ahora',
      withYouCount: 'contándote a ti',
      personSingular: 'persona',
      peoplePlural: 'personas',
      extraBoostCollected: 'Aporte extra acumulado',
      extraBoostHint: '¡El € extra por encima de la parte igual ayuda para más filamento!',
      topColorsRackTitle: 'Colores de Filamento Ganadores',
      spoolSlotLabel: 'Bobina',
      votesCount: 'votos',
      voteSingular: 'voto',
      pinnedTag: 'Fijado',
      simulatorTitle: 'Calculadora según Personas',
      simulatorSub: 'Desliza para ver cómo baja la cuota por persona cuantos más nos unamos:',
      simulatorPerPerson: 'por persona',
    },
    join: {
      sectionEyebrow: 'Apúntate',
      title: 'Únete al Crowdfunding',
      subtitle: 'Escribe tu nombre, personaliza cuánto quieres enviar (mínimo la parte proporcional o más) y vota por los colores de filamento.',
      lockedBannerTitle: '¡El grupo ya está cerrado!',
      lockedBannerDesc: 'Abajo tienes la cuota final de cada uno para hacer el pago y pedir la impresora.',
      completedBannerTitle: '¡Objetivo conseguido — mil gracias a todos!',
      completedBannerDesc: 'La compra conjunta está completa. ¡Mira el resumen final y los colores ganadores abajo!',
      formulaLabel: 'Cálculo del Mínimo en Vivo (contigo)',
      formulaTotal: 'Total',
      formulaDividedBy: 'Personas',
      formulaMinimum: 'Cuota Mínima',
      nameLabel: 'Tu Nombre',
      namePlaceholder: 'ej. Mamá, Papá, Lucas, Sofía...',
      amountLabel: 'Tu Aportación (€)',
      minRuleNotice: 'El mínimo permitido es Total ÷ Total de Personas',
      quickExactMin: 'Cuota exacta',
      quickRoundUp: 'Redondear',
      errorBelowMin: 'No puede ser menor que Total ÷ Total de Personas ({min}). Solo puedes enviar la cuota igual o más.',
      resetToMin: 'Poner el mínimo ({min})',
      errorNameRequired: '¡Por favor escribe tu nombre para apuntarte!',
      modeTitle: '¿Cómo quieres que funcione tu extra de +{extra} si se une más gente?',
      modeDynamicLabel: 'Mantener +{extra} extra sobre la cuota igual en vivo',
      modeDynamicDesc: 'Cuando se una más gente, tu cuota base seguirá bajando automáticamente manteniendo tus +{extra} extra.',
      modeFixedLabel: 'Fijar mi aportación total en {total}',
      modeFixedDesc: 'Tu aporte se queda fijo en {total} aunque se una más gente (siempre ≥ cuota mínima).',
      exactMinFeedback: '¡Cuota exacta! Cuantas más personas se unan después de ti, tu parte bajará automáticamente.',
      colorVoteLabel: 'Vota por los Colores de Filamento (máx. {max})',
      colorVoteHint: 'Opcional — ¡ayuda a elegir qué colores compramos!',
      noteLabel: 'Mensaje Corto (Opcional)',
      notePlaceholder: '¡Me apunto encantado/a! 🎉',
      submitBtn: 'Unirme y Confirmar mi Parte',
      submittingBtn: 'Apuntándote...',
      joinedBadge: '¡Ya estás dentro!',
      joinedTitle: '¡Gracias por apuntarte, {name}!',
      joinedSubtitle: 'Tu cuota se actualiza en tiempo real cada vez que alguien más se suma.',
      yourCurrentTotal: 'Tu aportación actual',
      yourBaseShare: 'Parte igual ({people} personas)',
      yourExtraBoost: 'Tu aporte extra',
      paidConfirmed: 'Marcado como Pagado — ¡gracias!',
      awaitingSettlement: 'Cálculo en vivo — baja aún más si se une más gente',
      editMyEntryBtn: 'Personalizar importe / colores',
      saveChangesBtn: 'Guardar cambios',
      cancelEditBtn: 'Cancelar',
      addAnotherPersonBtn: 'Apuntar a otro familiar desde este dispositivo',
      backToMyEntryBtn: 'Volver a mi participación',
      paymentTitle: 'Cómo enviar tu parte',
      paymentBeneficiary: 'Beneficiario',
      paymentIban: 'IBAN',
      copyIban: 'Copiar IBAN',
      ibanCopied: '¡Copiado!',
      openPaymentLink: 'Pagar ahora',
      updatedToast: '¡Tu participación se ha actualizado!',
      joinedToast: '¡Genial! Ya estás oficialmente en el grupo.',
    },
    colors: {
      eyebrow: 'Votación de Colores',
      title: 'Elige los Colores del Filamento',
      subtitle: 'Vamos a comprar {spools} bobinas Bambu Lab de 1 kg ({price}/kg). ¡Vota hasta por {max} colores oficiales!',
      leadingBadge: 'Top #{rank}',
      pinnedBadge: 'Elegido',
      voteBtn: 'Votar',
      votedBtn: 'Votado',
      preselectedBtn: 'Elegido',
      savingVotes: 'Guardando...',
      votesSavedToast: '¡Votos de color actualizados!',
      selectBeforeJoinHint: 'Elige hasta {max} colores aquí — ¡se guardarán automáticamente cuando te apuntes!',
      maxVotesReachedHint: 'Ya elegiste {max} colores — toca uno elegido si quieres cambiarlo.',
      votersLabel: 'Votado por:',
      noVotesYet: 'Aún sin votos — ¡sé la primera persona en votar!',
    },
    ledger: {
      eyebrow: 'Transparencia',
      title: 'Quiénes Participan',
      subtitle: 'Desglose en tiempo real de todos los que compartimos el gasto.',
      organizerBadge: 'Organizador',
      youBadge: 'Tú',
      paidBadge: 'Pagado',
      equalShareTag: 'Parte igual',
      boostTag: 'extra',
      fixedPledgeTag: 'Importe fijo',
      emptyState: '¡Sé la primera persona en unirte a {organizer} para compartir la Bambu Lab A1 mini!',
      howItWorksTitle: '¿Cómo funciona el reparto?',
      step1Title: '1. Total ÷ Total de Personas',
      step1Desc: 'El precio total (impresora tras los 120 € de descuento + bobinas de filamento) se divide por igual entre todos.',
      step2Title: '2. Personalizable solo hacia arriba',
      step2Desc: 'Nadie puede pagar menos del total dividido entre las personas — solo esa cifra exacta o más si quieres aportar extra.',
      step3Title: '3. Más barato cuantos más seamos',
      step3Desc: 'Cada familiar o amigo nuevo que se apunta reduce automáticamente la parte igual para todos.',
    },
    footer: {
      madeFor: 'Organizado por {organizer} · Reparto 100% transparente',
      liveSync: 'Sincronización en vivo',
      offlineMode: 'Modo Vista Previa',
      adminAccess: 'Panel Admin',
    },
  },
}

export function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('crowdfunding3d_locale')
    if (saved === 'en' || saved === 'nl' || saved === 'fr' || saved === 'es') {
      return saved
    }
    const navLangs = navigator.languages || [navigator.language || 'en']
    for (const lang of navLangs) {
      const prefix = lang.toLowerCase().slice(0, 2)
      if (prefix === 'nl') return 'nl'
      if (prefix === 'fr') return 'fr'
      if (prefix === 'es') return 'es'
      if (prefix === 'en') return 'en'
    }
  } catch {
    // fallback
  }
  return 'en'
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''))
}
