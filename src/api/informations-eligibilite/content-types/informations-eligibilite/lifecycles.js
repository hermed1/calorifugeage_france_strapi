const axios = require("axios");
const {
  sendEmail,
  buildEmailHTML,
  prepareAttachments,
} = require("../../../../lib/mailer");

const formatValue = (value) => value || "Non renseigné";
const formatBoolean = (value) => {
  if (value === true) return "Oui";
  if (value === false) return "Non";
  return "Non renseigné";
};
const formatMedia = (media) => {
  if (!media || (Array.isArray(media) && media.length === 0))
    return "Aucun fichier";
  if (Array.isArray(media)) return `${media.length} fichier(s)`;
  return "1 fichier";
};

const MEDIA_FIELDS = [
  "plansBatiment",
  "photosPlafondsCharpente",
  "photosCoinsBatiment",
  "photosZonesADestratifier",
  "photosObstaclesInterieurs",
  "photosPlaquesAppareilsChauffage",
  "photosExterieursBatiment",
];

const MEDIA_POPULATE = MEDIA_FIELDS.reduce((acc, field) => {
  acc[field] = true;
  return acc;
}, {});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logMediaState = (entry, prefix) => {
  const stats = MEDIA_FIELDS.reduce((acc, field) => {
    const value = entry[field];
    acc[field] = Array.isArray(value) ? value.length : value ? 1 : 0;
    return acc;
  }, {});

  console.log(`${prefix} état des médias :`, stats);
};

const buildSubject = (entry) =>
  `Demande d'intervention CEE : destratificateurs d'air / ${
    entry.RaisonSociale || "Non renseigné"
  } / ${entry.SIRET || "Non renseigné"}`;

const fetchEntryWithMedia = async (id) =>
  await strapi.entityService.findOne(
    "api::informations-eligibilite.informations-eligibilite",
    id,
    {
      populate: MEDIA_POPULATE,
    }
  );

const sendEmailWhenMediaReady = async (result) => {
  const MAX_ATTEMPTS = 5;
  const INITIAL_DELAY_MS = 2000;
  const RETRY_DELAY_MS = 2000;

  await wait(INITIAL_DELAY_MS);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const fullEntry = await fetchEntryWithMedia(result.id);
    logMediaState(fullEntry, `[afterCreate][tentative ${attempt}/${MAX_ATTEMPTS}]`);

    const attachments = prepareAttachments(fullEntry);

    if (attachments.length > 0 || attempt === MAX_ATTEMPTS) {
      const htmlContent = buildEmailHTML(fullEntry);

      await sendEmail({
        subject: buildSubject(fullEntry),
        html: htmlContent,
        attachments,
      });

      console.log(
        `[afterCreate] Email envoyé après ${attempt} tentative(s) (${attachments.length} PJ)`
      );
      return;
    }

    console.log(
      `[afterCreate] Aucune PJ détectée. Nouvelle tentative dans ${RETRY_DELAY_MS}ms`
    );
    await wait(RETRY_DELAY_MS);
  }
};

const buildMessage = (result, context) => `
${context}

**📋 INFORMATIONS ADMINISTRATIVES**
- Raison sociale : ${formatValue(result.RaisonSociale)}
- SIRET : ${formatValue(result.SIRET)}
- Adresse site : ${formatValue(result.AdresseSite)}
- Nom/Prénom signataire : ${formatValue(result.NomPrenomSignataire)}
- Fonction signataire : ${formatValue(result.FonctionSignataire)}
- Téléphone signataire : ${formatValue(result.TelephoneSignataire)}
- Email signataire : ${formatValue(result.emailSignataire)}

**🏢 INFORMATIONS GÉNÉRALES DU BÂTIMENT**
- Secteur : ${formatValue(result.Secteur)}
- Usage du site : ${formatValue(result.usageSite)}
- Type de local : ${formatValue(result.typeLocal)}
- Mode de fonctionnement : ${formatValue(result.modeFonctionnement)}
- Consigne température : ${formatValue(result.consigneTemperature)}
- Bâtiment zones multiples : ${formatBoolean(result.batimentZonesMultiples)}
- Détails zones : ${formatValue(result.batimentZonesDetails)}
- Année de construction du bâtiment : ${formatValue(
  result.anneeConstructionBatiment
)}

**📐 GÉOMÉTRIE**
- Hauteur moyenne sous plafond : ${formatValue(
  result.hauteurMoyenneSousPlafond
)}
- Hauteur max sous plafond : ${formatValue(result.hauteurMaxSousPlafond)}
- Longueur local : ${formatValue(result.longueurLocal)}
- Largeur local : ${formatValue(result.largeurLocal)}
- Surface à déstratifier : ${formatValue(result.surfaceADestratifier)}
- Volume total zone : ${formatValue(result.volumeTotalZoneADestratifier)}
- Volume exclu : ${formatValue(result.volumeExlu)}
- Zone identifiée sur plan : ${formatBoolean(result.zoneIdentifieeSurPlan)}
- Précisions éventuelles : ${formatValue(result.precisionsEventuelles)}
- Présence obstacle hauteur : ${formatBoolean(result.presenceObstacleHauteur)}
- Type obstacles : ${formatValue(result.siObstaclesTypeHauteur)}

**🔥 CHAUFFAGE**
- Type production chauffage : ${formatValue(result.typeProductionChauffage)}
- Nombre chaudières : ${formatValue(result.nombreChaudieres)}
- Puissance nominale par appareil : ${formatValue(
  result.puissanceNominaleParAppareil
)}
- Puissance totale génération : ${formatValue(
  result.puissanceTotalaeGeneration
)}
- Type chauffage : ${formatValue(result.typeChauffage)}
- Type appareils chauffage : ${formatValue(result.typeAppareilsChauffage)}
- Nombre appareils par type : ${formatValue(result.nombreAppareilsParType)}
- Marque/Modèle appareil : ${formatValue(result.marqueModeleAppareil)}
- Localisation appareils : ${formatValue(result.localisationAppareils)}

**💨 VENTILATION**
- Type ventilation : ${formatValue(result.typeVentilation)}
- Pression max : ${formatValue(result.ventilationPressionMax)}
- Débit : ${formatValue(result.ventilationDebit)}

**🌀 DÉSTRATIFICATION**
- Modèle déstrat précis : ${formatValue(result.modeleDestratPrecis)}

**📎 DOCUMENTS ET PHOTOS**
- Plans bâtiment : ${formatMedia(result.plansBatiment)}
- Photos plafonds/charpente : ${formatMedia(result.photosPlafondsCharpente)}
- Photos coins bâtiment : ${formatMedia(result.photosCoinsBatiment)}
- Photos zones à déstratifier : ${formatMedia(result.photosZonesADestratifier)}
- Photos obstacles intérieurs : ${formatMedia(result.photosObstaclesInterieurs)}
- Photos plaques appareils : ${formatMedia(
  result.photosPlaquesAppareilsChauffage
)}
- Photos extérieurs : ${formatMedia(result.photosExterieursBatiment)}

**💬 COMMENTAIRE**
${formatValue(result.commentaire)}
`;

const sendToDiscord = async (message, logPrefix) => {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  try {
    const response = await axios.post(discordWebhookUrl, {
      content: message,
    });
    console.log(
      `${logPrefix} Discord webhook envoyé (informations-eligibilite). Statut :`,
      response.status
    );
  } catch (error) {
    console.error(`${logPrefix} Erreur Discord (informations-eligibilite) :`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }
};

module.exports = {
  async afterCreate(event) {
    console.log(
      "[afterCreate] informations-eligibilite triggered",
      event.result
    );

    const { result } = event;

    // 1. Envoi du webhook Discord (existant)
    const message = buildMessage(
      result,
      "🆕 **NOUVEAU FORMULAIRE D'ÉLIGIBILITÉ REÇU**"
    );
    await sendToDiscord(message, "[afterCreate]");

    // 2. Planification de l'envoi d'email AVEC pièces jointes lorsque Strapi aura fini l'upload
    sendEmailWhenMediaReady(result).catch((error) => {
      console.error("[afterCreate] Erreur lors de l'envoi différé de l'email:", {
        message: error.message,
        stack: error.stack,
      });
    });
  },

  async afterUpdate(event) {
    console.log("[afterUpdate] informations-eligibilite triggered");

    // Envoi Discord uniquement pour les vraies mises à jour
    const message = buildMessage(
      event.result,
      "✏️ **FORMULAIRE D'ÉLIGIBILITÉ MIS À JOUR**"
    );
    await sendToDiscord(message, "[afterUpdate]");
  },
};
