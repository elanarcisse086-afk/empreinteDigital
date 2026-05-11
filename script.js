document.getElementById('btnEmpreinte').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = document.getElementById('nom').value;

    if (!nom) {
        alert("Veuillez entrer le nom de l'étudiant d'abord.");
        return;
    }

    // Vérifier si le navigateur supporte la biométrie
    if (window.PublicKeyCredential) {
        status.innerText = "Posez votre doigt sur le lecteur...";
        
        try {
            // Configuration factice pour la simulation WebAuthn
            const challenge = new Uint8Array(32); // Challenge de sécurité
            window.crypto.getRandomValues(challenge);

            const options = {
                publicKey: {
                    challenge: challenge,
                    rp: { name: "BioStock Simulation" },
                    user: {
                        id: Uint8Array.from(nom, c => c.charCodeAt(0)),
                        name: nom,
                        displayName: nom
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // Algorithme standard
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform" } // Force le lecteur local
                }
            };

            // Déclenche l'empreinte sur le téléphone
            const credential = await navigator.credentials.create(options);
            
            if (credential) {
                status.innerText = "✅ Empreinte de " + nom + " enregistrée !";
                status.style.color = "#27ae60";
                console.log("Succès :", credential);
            }
        } catch (err) {
            status.innerText = "❌ Erreur ou annulation.";
            status.style.color = "#c0392b";
            console.error(err);
        }
    } else {
        alert("Désolé, votre appareil ne supporte pas la biométrie Web.");
    }
});
