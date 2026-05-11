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

// FONCTIONS FEEDBACK (Audio + Voix)
function lancerFeedback(nom) {
    // 1. Le Bip
    new Audio('https://www.soundjay.com/button/beep-07.mp3').play().catch(() => {});
    
    // 2. Le Narrateur
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Bienvenue ${nom}. Accès autorisé.`);
        msg.lang = 'fr-FR';
        window.speechSynthesis.speak(msg);
    }
}

document.getElementById('btnScan').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nomFixe = "Ela Nkamje Narcisse Beauclaire"; // Simulation pour le prototype

    try {
        status.innerText = "Recherche de votre clé...";
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const assertion = await navigator.credentials.get({
            publicKey: { challenge, timeout: 60000, userVerification: "required" }
        });

        if (assertion) {
            // Enregistrement Firebase
            await addDoc(collection(db, "presences"), {
                nom: nomFixe,
                horodatage: serverTimestamp(),
                statut: "Présent"
            });

            // REMPLISSAGE DE LA BOÎTE DE DIALOGUE
            const heure = new Date().toLocaleTimeString();
            document.getElementById('details').innerHTML = `
                <p><b>Nom :</b> ${nomFixe}</p>
                <p><b>Heure :</b> ${heure}</p>
                <p><b>Lieu :</b> Bafoussam</p>
            `;

            // AFFICHAGE DE LA BOÎTE
            document.getElementById('modal').style.display = 'flex';
            
            lancerFeedback(nomFixe);
            status.innerText = "✅ Pointage réussi";
        }
    } catch (err) {
        status.innerText = "❌ Erreur ou aucune clé trouvée";
        console.error(err);
    }
});

// Fermer la boîte
document.getElementById('btnFermer').onclick = () => {
    document.getElementById('modal').style.display = 'none';
};
