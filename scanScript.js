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

// --- FONCTION PARLER AMÉLIORÉE ---
function parler(message) {
    if ('speechSynthesis' in window) {
        // On annule toute parole en cours pour éviter les blocages
        window.speechSynthesis.cancel(); 
        
        const msg = new SpeechSynthesisUtterance(message);
        msg.lang = 'fr-FR';
        msg.pitch = 1;
        msg.rate = 1;
        window.speechSynthesis.speak(msg);
    }
}

document.getElementById('btnScan').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = localStorage.getItem("nomUtilisateur") || "Utilisateur";
    const matricule = localStorage.getItem("matriculeUtilisateur") || "000";

    try {
        status.innerText = "Analyse de l'empreinte...";
        
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const assertion = await navigator.credentials.get({
            publicKey: { challenge, timeout: 60000, userVerification: "required" }
        });

        if (assertion) {
            const maintenant = new Date();
            const h = maintenant.getHours();
            const m = maintenant.getMinutes();
            
            // --- LOGIQUE DE STATUT ---
            let statutFinal = "Présent";
            let msgVocal = `Bienvenue ${nom}. Votre présence a été enregistrée.`;

            if (h > 8 || (h === 8 && m > 0)) {
                statutFinal = "En retard";
                msgVocal = `Attention ${nom}. Vous êtes en retard aujourd'hui.`;
            }

            // --- ÉTAPE CRUCIALE : PARLER TOUT DE SUITE ---
            // On parle avant d'attendre Firebase pour garder le lien avec le clic
            parler(msgVocal);

            // Mise à jour visuelle immédiate
            status.innerText = "✅ Authentification réussie";

            // Enregistrement Firebase (en arrière-plan)
            addDoc(collection(db, "presences"), {
                nom: nom,
                matricule: matricule,
                horodatage: serverTimestamp(),
                dateUnique: maintenant.toLocaleDateString('en-CA'),
                statut: statutFinal
            });

            // Préparation du lien WhatsApp
            const texteWhatsApp = `BIOSTOCK - Rapport\n---\nNom: ${nom}\nStatut: ${statutFinal}\nHeure: ${maintenant.toLocaleTimeString()}`;
            const lienWhatsApp = `https://wa.me/?text=${encodeURIComponent(texteWhatsApp)}`;

            // Affichage de la Modal
            document.getElementById('details').innerHTML = `
                <p style="font-size:1.2rem;">Bienvenue, <b>${nom}</b></p>
                <p>Statut: <span style="color:${statutFinal === 'Présent' ? '#22c55e' : '#ef4444'}; font-weight:bold;">${statutFinal}</span></p>
                <p>Heure: ${maintenant.toLocaleTimeString()}</p>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                <a href="${lienWhatsApp}" target="_blank" style="display:block; padding:12px; background:#25D366; color:white; text-decoration:none; border-radius:10px; font-weight:bold; text-align:center;">
                    PARTAGER SUR WHATSAPP
                </a>
            `;
            
            document.getElementById('modal').style.display = 'flex';
        }
    } catch (err) {
        console.error(err);
        status.innerText = "❌ Scan annulé ou erreur";
    }
});

document.getElementById('btnFermer').onclick = () => {
    document.getElementById('modal').style.display = 'none';
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
