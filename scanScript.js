import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDncZQBPC4i8YPWlNVrsDfXW5K7e4xIF2s",
    authDomain: "empreinte-df8eb.firebaseapp.com",
    projectId: "empreinte-df8eb",
    storageBucket: "empreinte-df8eb.firebasestorage.app",
    messagingSenderId: "359377971742",
    appId: "1:359377971742:web:0b9338130b71925dfedc0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function parler(message) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(message);
        msg.lang = 'fr-FR';
        window.speechSynthesis.speak(msg);
    }
}

document.getElementById('btnScan').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = localStorage.getItem("nomUtilisateur") || "Inconnu";
    const matricule = localStorage.getItem("matriculeUtilisateur") || "000";

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const assertion = await navigator.credentials.get({
            publicKey: { challenge, timeout: 60000, userVerification: "required" }
        });

        if (assertion) {
            const maintenant = new Date();
            const h = maintenant.getHours();
            const m = maintenant.getMinutes();
            
            // --- LOGIQUE DE RETARD (Limite 08h00) ---
            let statutFinal = "Présent";
            let msgVocal = `Bienvenue ${nom}. Vous êtes marqué présent.`;

            if (h > 8 || (h === 8 && m > 0)) {
                statutFinal = "En retard";
                msgVocal = `Attention ${nom}, vous êtes en retard.`;
            }

            // Enregistrement Firebase
            await addDoc(collection(db, "presences"), {
                nom: nom,
                matricule: matricule,
                horodatage: serverTimestamp(),
                dateUnique: maintenant.toLocaleDateString('en-CA'),
                statut: statutFinal
            });

            // --- MODIFICATION : GÉNÉRATION DU LIEN WHATSAPP ---
            const texteWhatsApp = `Rapport de Présence SOCEGO\n-------------------\nNom: ${nom}\nMatricule: ${matricule}\nStatut: ${statutFinal}\nHeure: ${maintenant.toLocaleTimeString()}\nDate: ${maintenant.toLocaleDateString('fr-FR')}`;
            const lienWhatsApp = `https://wa.me/?text=${encodeURIComponent(texteWhatsApp)}`;

            // Affichage Modal avec Bouton WhatsApp
            document.getElementById('details').innerHTML = `
                <p><b>Nom:</b> ${nom}</p>
                <p><b>Statut:</b> <span style="color:${statutFinal === 'Présent' ? 'green' : 'red'}">${statutFinal}</span></p>
                <p><b>Heure:</b> ${maintenant.toLocaleTimeString()}</p>
                <hr>
                <a href="${lienWhatsApp}" target="_blank" style="display:inline-block; padding:10px; background:#25D366; color:white; text-decoration:none; border-radius:5px; font-weight:bold; width:100%; text-align:center;">
                    ENVOYER PAR WHATSAPP
                </a>
            `;
            document.getElementById('modal').style.display = 'flex';
            
            parler(msgVocal);
            status.innerText = "✅ Succès";
        }
    } catch (err) {
        status.innerText = "❌ Échec du scan";
    }
});

document.getElementById('btnFermer').onclick = () => document.getElementById('modal').style.display = 'none';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
