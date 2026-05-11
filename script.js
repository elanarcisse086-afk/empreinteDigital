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

// 4. LOGIQUE D'ENRÔLEMENT AU CLIC
document.getElementById('btnEnregistrer').addEventListener('click', async () => {
    const nom = document.getElementById('nom').value;
    const matricule = document.getElementById('matricule').value;
    const status = document.getElementById('status');

    // Vérification simple
    if (!nom || !matricule) {
        alert("Veuillez remplir le nom et le matricule avant de continuer.");
        return;
    }

    try {
        status.innerText = "Communication avec le capteur...";
        status.style.color = "#1e293b";

        // Génération d'un challenge de sécurité
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // CONFIGURATION POUR CRÉER LA CLÉ D'ACCÈS (PASSKEY)
        const options = {
            publicKey: {
                challenge: challenge,
                rp: { name: "BioStock SOCEGO" }, 
                user: {
                    id: Uint8Array.from(nom, c => c.charCodeAt(0)),
                    name: nom,
                    displayName: nom
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                timeout: 60000,
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "required" 
                }
            }
        };

        // DÉCLENCHE L'APPARITION DE LA FENÊTRE SYSTÈME DU TÉLÉPHONE
        const credential = await navigator.credentials.create(options);
        
        if (credential) {
            // --- MODIFICATION : SAUVEGARDE LOCALE POUR LE MULTI-UTILISATEUR ---
            // On enregistre les infos dans la mémoire du téléphone actuel
            localStorage.setItem("nomUtilisateur", nom);
            localStorage.setItem("matriculeUtilisateur", matricule);

            // A. ENREGISTREMENT DES INFOS DANS FIREBASE
            await addDoc(collection(db, "etudiants"), {
                nom: nom,
                matricule: matricule,
                dateEnrolement: serverTimestamp()
            });

            // B. MISE À JOUR DE L'INTERFACE
            status.innerText = "✅ Succès ! Votre empreinte est liée à ce téléphone.";
            status.style.color = "#22c55e";
            
            alert("Enregistrement réussi ! Vous pouvez maintenant utiliser la page de Scan sur ce téléphone.");
        }
    } catch (err) {
        status.innerText = "❌ Échec : " + err.message;
        status.style.color = "#ef4444";
        console.error("Erreur d'enrôlement :", err);
    }
});
