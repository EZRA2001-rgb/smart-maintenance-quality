/**
 * Service pur pour calculer le devis réparation.
 * Objectif : réduire la complexité des fonctions Express/Controller.
 */

function getNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function computeLabor({ problemType, hoursWorked, isUrgent }) {
  if (!problemType) return { laborCost: 0, message: 'Heures non spécifiées' };

  if (problemType === 'Moteur') {
    return computeMotorLabor({ hoursWorked, isUrgent });
  }

  return computeNonMotorLabor({ hoursWorked, isUrgent });
}

function computeMotorLabor({ hoursWorked, isUrgent }) {
  const minHours = 5;
  const hours = hoursWorked > 0 ? hoursWorked : 0;
  const effectiveHours = hours > 0 ? Math.max(hours, minHours) : minHours;

  const rate = isUrgent ? 75 : 50;
  const laborCost = effectiveHours * rate;

  const message = buildMotorMessage({ isUrgent });
  return { laborCost, message };
}

function buildMotorMessage({ isUrgent }) {
  if (!isUrgent) return 'Forfait moteur appliqué (5h minimum)';
  return 'Forfait moteur appliqué (5h minimum) + Urgent (75€/h)';
}

function computeNonMotorLabor({ hoursWorked, isUrgent }) {
  const hours = hoursWorked > 0 ? hoursWorked : 0;
  if (hours <= 0) return { laborCost: 0, message: nonMotorNoHoursMessage(isUrgent) };

  const rate = isUrgent ? 75 : 50;
  const laborCost = hours * rate;
  const message = isUrgent ? 'Urgent (75€/h)' : 'Tarif horaire normal';

  return { laborCost, message };
}

function nonMotorNoHoursMessage(isUrgent) {
  return isUrgent ? 'Heures non spécifiées avec urgent' : 'Heures non spécifiées';
}

function computeParts({ partsReplaced, vehicleAge }) {
  const parts = Array.isArray(partsReplaced) ? partsReplaced : [];
  let totalPartsPrice = 0;


  for (const part of parts) {
    const price = getNumber(part?.price);
    if (!isValidPartPrice(price)) continue;

    totalPartsPrice += applyVehicleDiscount(price, vehicleAge);
  }

  const partsCost = totalPartsPrice > 0 ? totalPartsPrice * 1.20 : 0;
  return { partsCost };
}

function isValidPartPrice(price) {
  return Number.isFinite(price) && price > 0;
}

function applyVehicleDiscount(price, vehicleAge) {
  return vehicleAge > 10 ? price * 0.85 : price;
}

function buildFinalMessage({ problemType, laborCost, partsCost, initialMessage, totalEstimate }) {
  if (totalEstimate <= 0) return finalForNonPositive(laborCost, partsCost);

  if (!problemType) return 'Devis non valide';
  if (laborCost > 0) return messageWithLabor({ partsCost, initialMessage });

  return partsCost > 0 ? 'Pièces uniquement avec marge garage' : 'Devis non valide';
}

function finalForNonPositive(laborCost, partsCost) {
  return laborCost === 0 && partsCost === 0 ? 'Aucun coût calculé' : 'Devis non valide';
}

function messageWithLabor({ partsCost, initialMessage }) {
  return partsCost > 0
    ? `${initialMessage} - Pièces avec marge garage incluse`
    : `${initialMessage} - Main d'oeuvre uniquement`;
}


function calculateEstimate(payload) {
  const problemType = payload?.problemType;
  const hoursWorked = getNumber(payload?.hoursWorked);
  const partsReplaced = payload?.partsReplaced || [];
  const isUrgent = payload?.isUrgent === true;
  const vehicleAge = getNumber(payload?.vehicleAge);

  const safeHours = Number.isFinite(hoursWorked) ? hoursWorked : 0;
  const safeVehicleAge = Number.isFinite(vehicleAge) ? vehicleAge : 0;

  if (!problemType) {
    return { error: 'Type de problème requis' };
  }

  const { laborCost, message: laborMessage } = computeLabor({
    problemType,
    hoursWorked: safeHours,
    isUrgent
  });

  const { partsCost } = computeParts({
    partsReplaced,
    vehicleAge: safeVehicleAge
  });

  const totalEstimate = laborCost + partsCost;

  const detailsMessage = buildFinalMessage({
    problemType,
    laborCost,
    partsCost,
    initialMessage: laborMessage,
    totalEstimate
  });

  return {
    estimate: totalEstimate,
    details: {
      laborCost,
      partsCost,
      message: detailsMessage
    }
  };
}

module.exports = {
  calculateEstimate
};

