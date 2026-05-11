// 1. IMPORTATION DES SERVICES FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 2. CONFIGURATION FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDncZQBPC4i8YPWlNVrsDfXW5K7e4xIF2s",
    authDomain: "empreinte-df8eb.firebaseapp.com",
    projectId: "empreinte-df8eb",
    storageBucket: "empreinte-df8eb.firebasestorage.app",
    messagingSenderId: "359377971742",
    appId: "1:359377971742:web:0b9338130b71925dfedc0f"
};

// 3. INITIALISATION
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. FONCTIONS DE FEEDBACK (Sons et Voix)
function lancerFeedback(nom) {
    // Jouer le bip sonore
    const audio = new Audio('https://www.soundjay.com/button/beep-07.mp3');
    audio.play().catch(e => console.log("Audio bloqué par le navigateur"));

    // Synthèse vocale
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Bienvenue ${nom}. Accès autorisé.`);
        msg.lang = 'fr-FR';
        window.speechSynthesis.speak(msg);
    }
}

// 5. LOGIQUE DE SCAN RAPIDE
document.getElementById('btnScan').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const modal = document.getElementById('modal');
    const details = document.getElementById('details');
    
    // RÉCUPÉRATION DES INFOS DANS LA MÉMOIRE DU TÉLÉPHONE
    const nomReconnu = localStorage.getItem("nomUtilisateur");
    const matriculeReconnu = localStorage.getItem("matriculeUtilisateur");

    if (!nomReconnu) {
        status.innerText = "❌ Erreur : Aucun utilisateur enregistré sur ce téléphone.";
        status.style.color = "#ef4444";
        return;
    }

    try {
        status.innerText = "Analyse de l'empreinte en cours...";
        status.style.color = "#1e293b";

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // DEMANDER L'AUTHENTIFICATION AU TÉLÉPHONE
        const assertion = await navigator.credentials.get({
            publicKey: { 
                challenge: challenge, 
                timeout: 60000, 
                userVerification: "required" 
            }
        });

        if (assertion) {
            // A. ENREGISTREMENT DE LA PRÉSENCE DANS FIREBASE
            await addDoc(collection(db, "presences"), {
                nom: nomReconnu,
                matricule: matriculeReconnu,
                horodatage: serverTimestamp(),
                statut: "Présent"
            });

            // B. REMPLISSAGE DE LA BOÎTE DE DIALOGUE (MODAL)
            details.innerHTML = `
                <p style="margin: 5px 0;"><strong>Nom :</strong> ${nomReconnu}</p>
                <p style="margin: 5px 0;"><strong>Matricule :</strong> ${matriculeReconnu}</p>
                <p style="margin: 5px 0;"><strong>Heure :</strong> ${new Date().toLocaleTimeString()}</p>
                <p style="margin: 5px 0;"><strong>Lieu :</strong> SOCEGO Bafoussam</p>
            `;

            // C. AFFICHAGE DE LA BOÎTE DE DIALOGUE
            modal.style.display = 'flex';
            
            // D. LANCER LE SON ET LA VOIX
            lancerFeedback(nomReconnu);

            status.innerText = "✅ Identification réussie !";
            status.style.color = "#22c55e";
        }
    } catch (err) {
        status.innerText = "❌ Échec de l'identification.";
        status.style.color = "#ef4444";
        console.error("Erreur de scan :", err);
    }
});

// 6. FERMETURE DE LA BOÎTE DE DIALOGUE
document.getElementById('btnFermer').onclick = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('status').innerText = "Prêt pour le scan suivant";
    document.getElementById('status').style.color = "#1e293b";
};
