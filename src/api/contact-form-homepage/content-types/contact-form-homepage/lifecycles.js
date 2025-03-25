const axios = require("axios");

module.exports = {
  async afterCreate(event) {
    console.log("[afterCreate] contact-form-homepage triggered", event.result);

    const { result } = event;
    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1354194074319716492/zzFscjbZCgqjPV5XxurDjbSdAikeVPwpZtAXeF29xe_Ex1-OzpfS8-e_IkwrTAUj8wLl";

    const message = `
Nouveau formulaire reçu (contact-form-homepage) :

- Raison sociale : ${result.raison_sociale || "Non renseigné"}
- Nom : ${result.nom || "Non renseigné"}
- Téléphone : ${result.telephone || "Non renseigné"}
- Email : ${result.email || "Non renseigné"}
`;

    try {
      const response = await axios.post(discordWebhookUrl, {
        content: message,
      });
      console.log(
        "[afterCreate] Discord webhook envoyé (homepage). Statut :",
        response.status
      );
    } catch (error) {
      console.error(
        "[afterCreate] Erreur lors de l'envoi à Discord (homepage) :",
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        }
      );
    }
  },

  async afterUpdate(event) {
    console.log("[afterUpdate] contact-form-homepage triggered", event.result);

    const { result } = event;
    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1354194074319716492/zzFscjbZCgqjPV5XxurDjbSdAikeVPwpZtAXeF29xe_Ex1-OzpfS8-e_IkwrTAUj8wLl";

    const message = `
Formulaire mis à jour (contact-form-homepage) :

- Raison sociale : ${result.raison_sociale || "Non renseigné"}
- Nom : ${result.nom || "Non renseigné"}
- Téléphone : ${result.telephone || "Non renseigné"}
- Email : ${result.email || "Non renseigné"}
`;

    try {
      const response = await axios.post(discordWebhookUrl, {
        content: message,
      });
      console.log(
        "[afterUpdate] Discord webhook envoyé (homepage). Statut :",
        response.status
      );
    } catch (error) {
      console.error(
        "[afterUpdate] Erreur lors de l'envoi à Discord (homepage) :",
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        }
      );
    }
  },
};
