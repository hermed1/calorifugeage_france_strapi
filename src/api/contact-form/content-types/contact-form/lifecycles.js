// /src/api/contact-form/content-types/contact-form/lifecycles.js

const axios = require("axios");

module.exports = {
  async afterCreate(event) {
    // Juste pour voir dans les logs si le hook se déclenche
    console.log("[afterCreate] contact-form triggered");

    const { result } = event;

    // Ton URL Discord, identique pour afterCreate et afterUpdate
    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1349803873585598505/vBwhB3l8Rh-OXuepVJo55rN0gn-HX6fSHrPErz3zx_9_gkumP2T2nGlUm0bOX0wpgR6L";

    // Corps du message
    const message = `
Nouveau formulaire reçu (contact-form) :

- Raison sociale : ${result.raison_sociale || "Non renseigné"}
- SIRET : ${result.siret || "Non renseigné"}
- Nom : ${result.nom || "Non renseigné"}
- Sexe : ${result.sexe || "Non renseigné"}
- Message : ${result.message || "Non renseigné"}
- Horaire R : ${result.horaireR || "Non renseigné"}
- Horaire R fin : ${result.horaireRfin || "Non renseigné"}
- Téléphone : ${result.telephone || "Non renseigné"}
- Email : ${result.email || "Non renseigné"}
`;

    try {
      const response = await axios.post(discordWebhookUrl, {
        content: message,
      });
      console.log(
        "[afterCreate] Discord webhook envoyé. Statut :",
        response.status
      );
    } catch (error) {
      console.error("[afterCreate] Erreur Discord :", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
  },

  async afterUpdate(event) {
    console.log("[afterUpdate] contact-form triggered");

    const { result } = event;

    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1349803873585598505/vBwhB3l8Rh-OXuepVJo55rN0gn-HX6fSHrPErz3zx_9_gkumP2T2nGlUm0bOX0wpgR6L";

    const message = `
Formulaire mis à jour (contact-form) :

- Raison sociale : ${result.raison_sociale || "Non renseigné"}
- SIRET : ${result.siret || "Non renseigné"}
- Nom : ${result.nom || "Non renseigné"}
- Sexe : ${result.sexe || "Non renseigné"}
- Message : ${result.message || "Non renseigné"}
- Horaire R : ${result.horaireR || "Non renseigné"}
- Horaire R fin : ${result.horaireRfin || "Non renseigné"}
- Téléphone : ${result.telephone || "Non renseigné"}
- Email : ${result.email || "Non renseigné"}
`;

    try {
      const response = await axios.post(discordWebhookUrl, {
        content: message,
      });
      console.log(
        "[afterUpdate] Discord webhook envoyé. Statut :",
        response.status
      );
    } catch (error) {
      console.error("[afterUpdate] Erreur Discord :", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
  },
};
