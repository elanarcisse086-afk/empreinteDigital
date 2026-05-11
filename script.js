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

// --- LE NARRATEUR (TOUJOURS PRÉSENT) ---
function direBienvenue(nom) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`Bienvenue ${nom}. Votre identité est confirmée.`);
        msg.lang = 'fr-FR';
        window.speechSynthesis.speak(msg);
    }
}

// --- LE BIP SONORE ---
function jouerBip() {
    new Audio('https://www.soundjay.com/button/beep-07.mp3').play().catch(() => {});
}

document.getElementById('btnEmpreinte').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = document.getElementById('nom').value;
    const matricule = document.getElementById('matricule').value;

    if (!nom) return alert("Veuillez saisir votre nom !");

    try {
        status.innerText = "Posez votre doigt...";
        
        // Simulation de scan biométrique
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const options = {
            publicKey: {
                challenge: challenge,
                rp: { name: "BioStock" },
                user: { id: Uint8Array.from(nom, c => c.charCodeAt(0)), name: nom, displayName: nom },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                timeout: 60000,
                authenticatorSelection: { authenticatorAttachment: "platform" }
            }
        };

        const credential = await navigator.credentials.create(options);
        
        if (credential) {
            // 1. Enregistrement dans Firebase pour le Dashboard SOCEGO
            await addDoc(collection(db, "presences"), {
                nom: nom,
                matricule: matricule || "ID-VERIFIÉ",
                horodatage: serverTimestamp()
            });

            // 2. Préparation des informations pour la boîte de dialogue
            const heure = new Date().toLocaleTimeString();
            document.getElementById('infoDetails').innerHTML = `
                <b>Nom:</b> ${nom}<br>
                <b>Heure:</b> ${heure}<br>
                <b>Statut:</b> Présent ✅
            `;

            // 3. Affichage de la boîte de dialogue
            document.getElementById('infoModal').style.display = 'flex';

            // 4. Feedback sonore et vocal
            jouerBip();
            setTimeout(() => direBienvenue(nom), 500);

            status.innerText = "✅ Pointage réussi !";
        }
    } catch (err) {
        status.innerText = "❌ Échec de l'identification";
    }
});

// Fermer la boîte de dialogue
document.getElementById('btnFermer').onclick = () => {
    document.getElementById('infoModal').style.display = 'none';
};
