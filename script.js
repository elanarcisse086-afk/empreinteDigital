// Importation des modules Firebase via CDN (plus simple pour GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Tes clés que tu viens de récupérer
const firebaseConfig = {
  apiKey: "AIzaSyDncZQBPC4i8YPWlNVrsDfXW5K7e4xIF2s",
  authDomain: "empreinte-df8eb.firebaseapp.com",
  projectId: "empreinte-df8eb",
  storageBucket: "empreinte-df8eb.firebasestorage.app",
  messagingSenderId: "359377971742",
  appId: "1:359377971742:web:0b9338130b71925dfedc0f",
  measurementId: "G-HBTX4F50T1"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById('btnEmpreinte').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const nom = document.getElementById('nom').value;
    const matricule = document.getElementById('matricule').value;

    if (!nom || !matricule) {
        alert("Veuillez remplir le nom et le matricule !");
        return;
    }

    if (window.PublicKeyCredential) {
        status.innerText = "Posez votre doigt sur le capteur...";
        
        try {
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

            const credential = await navigator.credentials.create(options);
            
            if (credential) {
                // ENVOI DES DONNÉES VERS FIREBASE
                await addDoc(collection(db, "presences"), {
                    nom: nom,
                    matricule: matricule,
                    horodatage: serverTimestamp(),
                    statut: "Présent"
                });

                status.innerText = "✅ Succès ! Pointage enregistré dans le Cloud.";
                status.style.color = "#27ae60";
            }
        } catch (err) {
            status.innerText = "❌ Erreur : " + err.message;
            console.error(err);
        }
    } else {
        alert("Biométrie non supportée sur ce navigateur.");
    }
});
