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

// --- FONCTIONS FEEDBACK ---
function direBienvenue(nom) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Bienvenue ${nom}. Accès autorisé.`);
        msg.lang = 'fr-FR';
        window.speechSynthesis.speak(msg);
    }
}

function jouerBip() {
    new Audio('https://www.soundjay.com/button/beep-07.mp3').play().catch(() => {});
}

// --- LOGIQUE DE SCAN ---
document.getElementById('btnScanRapide').addEventListener('click', async () => {
    const status = document.getElementById('status');
    
    try {
        status.innerText = "Recherche de votre empreinte...";

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // On demande au téléphone de RECONNAÎTRE un utilisateur déjà inscrit
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: challenge,
                timeout: 60000,
                userVerification: "required"
            }
        });

        if (assertion) {
            // Dans un système réel, l'ID utilisateur est stocké dans l'assertion.
            // Pour ton prototype, on récupère le nom associé à la clé.
            const nomReconnu = "Ela Nkamje Narcisse"; // Simulation de la reconnaissance

            // 1. Envoi au Dashboard
            await addDoc(collection(db, "presences"), {
                nom: nomReconnu,
                horodatage: serverTimestamp(),
                statut: "Présent"
            });

            // 2. Affichage Modal
            document.getElementById('infoDetails').innerHTML = `
                <div style="font-size:2rem; margin-bottom:10px;">👤</div>
                <b>Utilisateur :</b> ${nomReconnu}<br>
                <b>Heure :</b> ${new Date().toLocaleTimeString()}<br>
                <b>Lieu :</b> SOCEGO Bafoussam
            `;
            document.getElementById('infoModal').style.display = 'flex';

            // 3. Sons et Voix
            jouerBip();
            setTimeout(() => direBienvenue(nomReconnu), 500);

            status.innerText = "✅ Identifié avec succès";
        }
    } catch (err) {
        status.innerText = "❌ Empreinte non reconnue";
        console.error(err);
    }
});

// Fermeture
document.getElementById('btnFermer').onclick = () => {
    document.getElementById('infoModal').style.display = 'none';
    document.getElementById('status').innerText = "Prêt pour le scan suivant";
};
