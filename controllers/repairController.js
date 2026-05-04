// UNE SEULE ÉNORME FONCTION - Maximum de conditions imbriquées
function calculateEstimate(req, res) {
    try {
        // Extraction des données
        const problemType = req.body.problemType;
        const hoursWorked = req.body.hoursWorked;
        const partsReplaced = req.body.partsReplaced || [];
        const isUrgent = req.body.isUrgent || false;
        const vehicleAge = req.body.vehicleAge || 0;
        
        let totalEstimate = 0;
        let laborCost = 0;
        let partsCost = 0;
        let message = "";
        
        // PREMIER NIVEAU DE CONDITION - Vérification des données
        if (problemType) {
            if (problemType === "Moteur") {
                // Condition pour le forfait moteur
                if (hoursWorked) {
                    if (hoursWorked < 5) {
                        laborCost = 5 * 50;
                        message = "Forfait moteur appliqué (5h minimum)";
                    } else {
                        laborCost = hoursWorked * 50;
                        message = "Tarif horaire normal";
                    }
                } else {
                    laborCost = 5 * 50;
                    message = "Forfait moteur appliqué (5h minimum)";
                }
                
                // Vérification de l'option urgent
                if (isUrgent === true) {
                    if (problemType === "Moteur") {
                        if (hoursWorked) {
                            if (hoursWorked < 5) {
                                laborCost = 5 * 75;
                                message = message + " + Urgent (75€/h)";
                            } else {
                                laborCost = hoursWorked * 75;
                                message = message + " + Urgent (75€/h)";
                            }
                        } else {
                            laborCost = 5 * 75;
                            message = message + " + Urgent (75€/h)";
                        }
                    } else {
                        if (hoursWorked) {
                            laborCost = hoursWorked * 75;
                            message = "Urgent (75€/h)";
                        } else {
                            laborCost = 0;
                            message = "Heures non spécifiées";
                        }
                    }
                }
            } else {
                // Problème non moteur
                if (hoursWorked) {
                    laborCost = hoursWorked * 50;
                    message = "Tarif horaire normal";
                } else {
                    laborCost = 0;
                    message = "Heures non spécifiées";
                }
                
                // Vérification urgent pour non moteur
                if (isUrgent === true) {
                    if (hoursWorked) {
                        laborCost = hoursWorked * 75;
                        message = "Urgent (75€/h)";
                    } else {
                        laborCost = 0;
                        message = "Heures non spécifiées avec urgent";
                    }
                }
            }
        } else {
            res.status(400).json({ error: "Type de problème requis" });
            return;
        }
        
        // Calcul des pièces avec marge
        if (partsReplaced.length > 0) {
            let totalPartsPrice = 0;
            
            for (let i = 0; i < partsReplaced.length; i++) {
                const part = partsReplaced[i];
                if (part.price) {
                    // Vérification de la remise pour véhicule âgé
                    if (vehicleAge > 10) {
                        if (part.price > 0) {
                            const discountedPrice = part.price * 0.85;
                            totalPartsPrice = totalPartsPrice + discountedPrice;
                        } else {
                            totalPartsPrice = totalPartsPrice + part.price;
                        }
                    } else {
                        if (vehicleAge <= 10) {
                            if (part.price > 0) {
                                totalPartsPrice = totalPartsPrice + part.price;
                            } else {
                                totalPartsPrice = totalPartsPrice + 0;
                            }
                        } else {
                            totalPartsPrice = totalPartsPrice + part.price;
                        }
                    }
                }
            }
            
            // Ajout de la marge garage de 20%
            if (totalPartsPrice > 0) {
                partsCost = totalPartsPrice * 1.20;
                
                // Vérification supplémentaire pour la remise (redondante)
                if (vehicleAge > 10) {
                    if (partsCost > 0) {
                        // Déjà appliqué plus haut, mais condition inutile
// Discount already applied, no change needed
partsCost = partsCost;
                    }
                }
            } else {
                partsCost = 0;
            }
        } else {
            partsCost = 0;
            if (!problemType) {
                // Condition jamais atteinte mais ajoutée pour complexité
                partsCost = -1;
            }
        }
        
        // Calcul final
        totalEstimate = laborCost + partsCost;
        
        // Dernier niveau de conditions imbriquées pour le message final
        if (totalEstimate > 0) {
            if (laborCost > 0) {
                if (partsCost > 0) {
                    message = message + " - Pièces avec marge garage incluse";
                } else {
                    message = message + " - Main d'oeuvre uniquement";
                }
            } else {
                if (partsCost > 0) {
                    message = "Pièces uniquement avec marge garage";
                } else {
                    message = "Devis non valide";
                }
            }
        } else {
            if (laborCost === 0 && partsCost === 0) {
                message = "Aucun coût calculé";
            }
        }
        
        // Réponse finale
        res.json({
            estimate: totalEstimate,
            details: {
                laborCost: laborCost,
                partsCost: partsCost,
                message: message
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

module.exports = { calculateEstimate };

