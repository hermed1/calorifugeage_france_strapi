const nodemailer = require("nodemailer");

/**
 * Fonction pour envoyer un email via Nodemailer avec OAuth2
 * @param {Object} options - Options de l'email
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {Array} options.attachments - Pièces jointes (optionnel)
 * @returns {Promise<void>}
 */
async function sendEmail({ subject, html, attachments = [] }) {
  try {
    // Configuration du transporteur Nodemailer avec OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_EXPEDITEUR,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    // Options de l'email
    const mailOptions = {
      from: `Réseau-CEE <${process.env.EMAIL_EXPEDITEUR}>`,
      to: process.env.EMAIL_DESTINATAIRE,
      subject: subject,
      html: html,
      attachments: attachments,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès :", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw error;
  }
}

/**
 * Fonction pour construire le HTML de l'email à partir des données du formulaire
 * @param {Object} formData - Données du formulaire
 * @returns {string} - HTML de l'email
 */
function buildEmailHTML(formData) {
  const formatValue = (value) => value || "Non renseigné";
  const formatBoolean = (value) => {
    if (value === true) return "Oui";
    if (value === false) return "Non";
    return "Non renseigné";
  };
  const formatMedia = (media) => {
    if (!media || (Array.isArray(media) && media.length === 0)) return "Aucun fichier";
    if (Array.isArray(media)) return `${media.length} fichier(s)`;
    return "1 fichier";
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 18px;
      background-color: #ecf0f1;
      padding: 10px;
      border-left: 4px solid #3498db;
    }
    .field {
      margin: 10px 0;
      padding: 8px;
      background-color: #f9f9f9;
      border-left: 3px solid #bdc3c7;
    }
    .field-label {
      font-weight: bold;
      color: #2c3e50;
    }
    .field-value {
      color: #555;
      margin-left: 10px;
    }
    .header {
      background-color: #3498db;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🆕 Nouveau Formulaire d'Éligibilité</h1>
  </div>

  <h2>📋 INFORMATIONS ADMINISTRATIVES</h2>
  <div class="field">
    <span class="field-label">Raison sociale :</span>
    <span class="field-value">${formatValue(formData.RaisonSociale)}</span>
  </div>
  <div class="field">
    <span class="field-label">SIRET :</span>
    <span class="field-value">${formatValue(formData.SIRET)}</span>
  </div>
  <div class="field">
    <span class="field-label">Adresse site :</span>
    <span class="field-value">${formatValue(formData.AdresseSite)}</span>
  </div>
  <div class="field">
    <span class="field-label">Nom/Prénom signataire :</span>
    <span class="field-value">${formatValue(formData.NomPrenomSignataire)}</span>
  </div>
  <div class="field">
    <span class="field-label">Fonction signataire :</span>
    <span class="field-value">${formatValue(formData.FonctionSignataire)}</span>
  </div>
  <div class="field">
    <span class="field-label">Téléphone signataire :</span>
    <span class="field-value">${formatValue(formData.TelephoneSignataire)}</span>
  </div>
  <div class="field">
    <span class="field-label">Email signataire :</span>
    <span class="field-value">${formatValue(formData.emailSignataire)}</span>
  </div>

  <h2>🏢 INFORMATIONS GÉNÉRALES DU BÂTIMENT</h2>
  <div class="field">
    <span class="field-label">Secteur :</span>
    <span class="field-value">${formatValue(formData.Secteur)}</span>
  </div>
  <div class="field">
    <span class="field-label">Usage du site :</span>
    <span class="field-value">${formatValue(formData.usageSite)}</span>
  </div>
  <div class="field">
    <span class="field-label">Type de local :</span>
    <span class="field-value">${formatValue(formData.typeLocal)}</span>
  </div>
  <div class="field">
    <span class="field-label">Mode de fonctionnement :</span>
    <span class="field-value">${formatValue(formData.modeFonctionnement)}</span>
  </div>
  <div class="field">
    <span class="field-label">Consigne température :</span>
    <span class="field-value">${formatValue(formData.consigneTemperature)}</span>
  </div>
  <div class="field">
    <span class="field-label">Bâtiment zones multiples :</span>
    <span class="field-value">${formatBoolean(formData.batimentZonesMultiples)}</span>
  </div>
  <div class="field">
    <span class="field-label">Détails zones :</span>
    <span class="field-value">${formatValue(formData.batimentZonesDetails)}</span>
  </div>
  <div class="field">
    <span class="field-label">Année de construction du bâtiment :</span>
    <span class="field-value">${formatValue(formData.anneeConstructionBatiment)}</span>
  </div>

  <h2>📐 GÉOMÉTRIE</h2>
  <div class="field">
    <span class="field-label">Hauteur moyenne sous plafond :</span>
    <span class="field-value">${formatValue(formData.hauteurMoyenneSousPlafond)}</span>
  </div>
  <div class="field">
    <span class="field-label">Hauteur max sous plafond :</span>
    <span class="field-value">${formatValue(formData.hauteurMaxSousPlafond)}</span>
  </div>
  <div class="field">
    <span class="field-label">Longueur local :</span>
    <span class="field-value">${formatValue(formData.longueurLocal)}</span>
  </div>
  <div class="field">
    <span class="field-label">Largeur local :</span>
    <span class="field-value">${formatValue(formData.largeurLocal)}</span>
  </div>
  <div class="field">
    <span class="field-label">Surface à déstratifier :</span>
    <span class="field-value">${formatValue(formData.surfaceADestratifier)}</span>
  </div>
  <div class="field">
    <span class="field-label">Volume total zone :</span>
    <span class="field-value">${formatValue(formData.volumeTotalZoneADestratifier)}</span>
  </div>
  <div class="field">
    <span class="field-label">Volume exclu :</span>
    <span class="field-value">${formatValue(formData.volumeExlu)}</span>
  </div>
  <div class="field">
    <span class="field-label">Zone identifiée sur plan :</span>
    <span class="field-value">${formatBoolean(formData.zoneIdentifieeSurPlan)}</span>
  </div>
  <div class="field">
    <span class="field-label">Précisions éventuelles :</span>
    <span class="field-value">${formatValue(formData.precisionsEventuelles)}</span>
  </div>
  <div class="field">
    <span class="field-label">Présence obstacle hauteur :</span>
    <span class="field-value">${formatBoolean(formData.presenceObstacleHauteur)}</span>
  </div>
  <div class="field">
    <span class="field-label">Type obstacles :</span>
    <span class="field-value">${formatValue(formData.siObstaclesTypeHauteur)}</span>
  </div>

  <h2>🔥 CHAUFFAGE</h2>
  <div class="field">
    <span class="field-label">Type production chauffage :</span>
    <span class="field-value">${formatValue(formData.typeProductionChauffage)}</span>
  </div>
  <div class="field">
    <span class="field-label">Nombre chaudières :</span>
    <span class="field-value">${formatValue(formData.nombreChaudieres)}</span>
  </div>
  <div class="field">
    <span class="field-label">Puissance nominale par appareil :</span>
    <span class="field-value">${formatValue(formData.puissanceNominaleParAppareil)}</span>
  </div>
  <div class="field">
    <span class="field-label">Puissance totale génération :</span>
    <span class="field-value">${formatValue(formData.puissanceTotalaeGeneration)}</span>
  </div>
  <div class="field">
    <span class="field-label">Type chauffage :</span>
    <span class="field-value">${formatValue(formData.typeChauffage)}</span>
  </div>
  <div class="field">
    <span class="field-label">Type appareils chauffage :</span>
    <span class="field-value">${formatValue(formData.typeAppareilsChauffage)}</span>
  </div>
  <div class="field">
    <span class="field-label">Nombre appareils par type :</span>
    <span class="field-value">${formatValue(formData.nombreAppareilsParType)}</span>
  </div>
  <div class="field">
    <span class="field-label">Marque/Modèle appareil :</span>
    <span class="field-value">${formatValue(formData.marqueModeleAppareil)}</span>
  </div>
  <div class="field">
    <span class="field-label">Localisation appareils :</span>
    <span class="field-value">${formatValue(formData.localisationAppareils)}</span>
  </div>

  <h2>💨 VENTILATION</h2>
  <div class="field">
    <span class="field-label">Type ventilation :</span>
    <span class="field-value">${formatValue(formData.typeVentilation)}</span>
  </div>
  <div class="field">
    <span class="field-label">Pression max :</span>
    <span class="field-value">${formatValue(formData.ventilationPressionMax)}</span>
  </div>
  <div class="field">
    <span class="field-label">Débit :</span>
    <span class="field-value">${formatValue(formData.ventilationDebit)}</span>
  </div>

  <h2>🌀 DÉSTRATIFICATION</h2>
  <div class="field">
    <span class="field-label">Modèle déstrat précis :</span>
    <span class="field-value">${formatValue(formData.modeleDestratPrecis)}</span>
  </div>

  <h2>📎 DOCUMENTS ET PHOTOS</h2>
  <div class="field">
    <span class="field-label">Plans bâtiment :</span>
    <span class="field-value">${formatMedia(formData.plansBatiment)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos plafonds/charpente :</span>
    <span class="field-value">${formatMedia(formData.photosPlafondsCharpente)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos coins bâtiment :</span>
    <span class="field-value">${formatMedia(formData.photosCoinsBatiment)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos zones à déstratifier :</span>
    <span class="field-value">${formatMedia(formData.photosZonesADestratifier)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos obstacles intérieurs :</span>
    <span class="field-value">${formatMedia(formData.photosObstaclesInterieurs)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos plaques appareils :</span>
    <span class="field-value">${formatMedia(formData.photosPlaquesAppareilsChauffage)}</span>
  </div>
  <div class="field">
    <span class="field-label">Photos extérieurs :</span>
    <span class="field-value">${formatMedia(formData.photosExterieursBatiment)}</span>
  </div>

  <h2>💬 COMMENTAIRE</h2>
  <div class="field">
    <span class="field-value">${formatValue(formData.commentaire)}</span>
  </div>

  <div class="footer">
    <p>Ce formulaire a été soumis via le site ECO-CEE.fr</p>
    <p>Date de réception : ${new Date().toLocaleString("fr-FR")}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Fonction pour préparer les pièces jointes depuis les médias Strapi
 * @param {Object} formData - Données du formulaire contenant les médias
 * @returns {Array} - Tableau des pièces jointes pour Nodemailer
 */
function prepareAttachments(formData) {
  const attachments = [];

  // Liste des champs contenant des fichiers
  const mediaFields = [
    "plansBatiment",
    "photosPlafondsCharpente",
    "photosCoinsBatiment",
    "photosZonesADestratifier",
    "photosObstaclesInterieurs",
    "photosPlaquesAppareilsChauffage",
    "photosExterieursBatiment",
  ];

  mediaFields.forEach((fieldName) => {
    const media = formData[fieldName];

    if (media && Array.isArray(media) && media.length > 0) {
      // Si c'est un tableau de médias
      media.forEach((file, index) => {
        if (file && file.url) {
          const fileUrl = file.url.startsWith('http')
            ? file.url
            : `${process.env.STRAPI_URL || "http://localhost:1337"}${file.url}`;

          attachments.push({
            filename: file.name || `${fieldName}_${index + 1}_${file.hash}${file.ext}`,
            path: fileUrl,
          });
        }
      });
    } else if (media && media.url) {
      // Si c'est un seul média
      const fileUrl = media.url.startsWith('http')
        ? media.url
        : `${process.env.STRAPI_URL || "http://localhost:1337"}${media.url}`;

      attachments.push({
        filename: media.name || `${fieldName}_${media.hash}${media.ext}`,
        path: fileUrl,
      });
    }
  });

  return attachments;
}

module.exports = {
  sendEmail,
  buildEmailHTML,
  prepareAttachments,
};
