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

    // 2. Envoi de l'email avec Nodemailer
    try {
      console.log("[afterCreate] Préparation de l'email...");

      // IMPORTANT: Attendre 3 secondes pour que Strapi finisse de sauvegarder les médias
      console.log("[afterCreate] Attente de 3 secondes pour la sauvegarde des médias...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // IMPORTANT: Récupérer l'entrée complète avec les médias populés
      const fullEntry = await strapi.entityService.findOne(
        "api::informations-eligibilite.informations-eligibilite",
        result.id,
        {
          populate: {
            plansBatiment: true,
            photosPlafondsCharpente: true,
            photosCoinsBatiment: true,
            photosZonesADestratifier: true,
            photosObstaclesInterieurs: true,
            photosPlaquesAppareilsChauffage: true,
            photosExterieursBatiment: true,
          },
        }
      );

      console.log("[afterCreate] Entrée complète récupérée avec médias:", {
        id: fullEntry.id,
        plansBatiment: fullEntry.plansBatiment?.length || 0,
        photosPlafondsCharpente: fullEntry.photosPlafondsCharpente?.length || 0,
        photosCoinsBatiment: fullEntry.photosCoinsBatiment?.length || 0,
        photosZonesADestratifier: fullEntry.photosZonesADestratifier?.length || 0,
        photosObstaclesInterieurs: fullEntry.photosObstaclesInterieurs?.length || 0,
        photosPlaquesAppareilsChauffage: fullEntry.photosPlaquesAppareilsChauffage?.length || 0,
        photosExterieursBatiment: fullEntry.photosExterieursBatiment?.length || 0,
      });

      // DEBUG: Afficher le premier fichier si présent
      if (fullEntry.plansBatiment && fullEntry.plansBatiment.length > 0) {
        console.log("[afterCreate] Premier fichier plansBatiment:", JSON.stringify(fullEntry.plansBatiment[0], null, 2));
      } else {
        console.log("[afterCreate] ⚠️ AUCUN média trouvé ! Vérifiez que les fichiers sont bien uploadés depuis le frontend.");
      }

      // Construire le HTML de l'email
      const htmlContent = buildEmailHTML(fullEntry);

      // Préparer les pièces jointes
      const attachments = prepareAttachments(fullEntry);

      console.log(`[afterCreate] ${attachments.length} pièce(s) jointe(s) préparée(s)`);

      // Envoyer l'email
      await sendEmail({
        subject: `Demande d'intervention CEE : destratificateurs d'air / ${
          result.RaisonSociale || "Non renseigné"
        } / SIRET: ${result.SIRET || "Non renseigné"}`,
        html: htmlContent,
        attachments: attachments,
      });

      console.log(
        "[afterCreate] Email envoyé avec succès (informations-eligibilite)"
      );
    } catch (error) {
      console.error(
        "[afterCreate] Erreur lors de l'envoi de l'email (informations-eligibilite) :",
        {
          message: error.message,
          stack: error.stack,
        }
      );
      // On ne bloque pas le processus même si l'email échoue
    }
  },

  async afterUpdate(event) {
    console.log(
      "[afterUpdate] informations-eligibilite triggered",
      event.result
    );

    const message = buildMessage(
      event.result,
      "✏️ **FORMULAIRE D'ÉLIGIBILITÉ MIS À JOUR**"
    );

    await sendToDiscord(message, "[afterUpdate]");
  },
};
