module.exports = {
  async afterCreate(event) {
    const { result } = event;

    // URL de ton webhook Discord
    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1344613993423175751/…";

    // Construction du message
    // On utilise l'opérateur || pour gérer le cas où la propriété serait undefined ou vide
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

    // Envoi vers Discord
    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  },

  async afterUpdate(event) {
    const { result } = event;

    const discordWebhookUrl =
      "https://discord.com/api/webhooks/1344613993423175751/uKfWFVKshdKZ72lwlnaq3zA2TT_vw7zu2HNh7sBmPzJ4xP9gD8y7-p2Qak_SF8sFk-x_";

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

    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  },
};
