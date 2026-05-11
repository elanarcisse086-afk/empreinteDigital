// Importation des modules Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Configuration de ton projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDncZQBPC4i8YPWlNVrsDfXW5K7e4xIF2s",
  authDomain: "empreinte-df8eb.firebaseapp.com",
  projectId: "empreinte-df8eb",
  storageBucket: "empreinte-df8eb.firebasestorage.app",
  messagingSenderId: "359377971742",
  appId: "1:359377971742:web:0b9338130b71925dfedc0f",
  measurementId: "G-HBTX4F50T1"
};

// Initialisation de Firebase et de la base de données Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * FONCTION POUR LE NARRATEUR VOCAL
 * Elle utilise l'API de synthèse vocale du navigateur
 */
function direBienvenue(nom) {
    const synthese = window.speechSynthesis;
    const message = new SpeechSynthesisUtterance(`Bienvenue ${nom}. Votre pointage est validé.`);
    message.lang = 'fr-FR'; // Langue française
    message.rate = 1;      // Vitesse normale de la voix
    synthese.speak(message);
}

/**
 * FONCTION POUR LE BIP SONORE
 */
function jouerBip() {
    const audio = new Audio('https://www.soundjay.com/button/beep-07.mp3');
    audio.play();
}

// Ecouteur d'événement sur le bouton d'enregistrement
document.getElementById('btnEmpreinte').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = document.getElementById('nom').value;
    const matricule = document.getElementById('matricule').value;

    // Vérification que les champs ne sont pas vides
    if (!nom || !matricule) {
        alert("Veuillez remplir le nom et le matricule !");
        return;
    }

    // Vérification de la compatibilité biométrique du navigateur
    if (window.PublicKeyCredential) {
        status.innerText = "Posez votre doigt sur le capteur...";
        
        try {
            // Création d'un défi (challenge) pour la sécurité biométrique
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options = {
                publicKey: {
                    challenge: challenge,
                    rp: { name: "BioStock" },
                    user: {
                        id: Uint8Array.from(nom, c => c.charCodeAt(0)),
                        name: nom,
                        displayName: nom
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform" }
                }
            };

            // Appel au capteur d'empreinte du téléphone/PC
            const credential = await navigator.credentials.create(options);
            
            if (credential) {
                // 1. Enregistrement des données dans le Cloud (Firebase)
                await addDoc(collection(db, "presences"), {
                    nom: nom,
                    matricule: matricule,
                    horodatage: serverTimestamp(),
                    statut: "Présent"
                });

                // 2. Feedback visuel
                status.innerText = `✅ Succès ! Bienvenue ${nom}.`;
                status.style.color = "#27ae60";

                // 3. Feedback sonore (Bip)
                jouerBip();

                // 4. Feedback vocal (Narrateur)
                // On attend un tout petit peu après le bip pour parler
                setTimeout(() => {
                    direBienvenue(nom);
                }, 500);
            }
        } catch (err) {
            status.innerText = "❌ Erreur : " + err.message;
            console.error(err);
        }
    } else {
        alert("Biométrie non supportée sur ce navigateur.");
    }
});
