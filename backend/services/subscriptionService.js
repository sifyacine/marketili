







const Subscription = require("../models/Subscription");
const { TRIAL_DAYS, CURRENCY, PLANS, ROLE_TO_MODEL } = require("../config/plans");

const Client = require("../models/Client");
const Agency = require("../models/Agency");
const Team = require("../models/Team");
const Freelancer = require("../models/Freelancer");

const MODEL_BY_ROLE = { client: Client, agency: Agency, team: Team, freelancer: Freelancer };

const DAY_MS = 24 * 60 * 60 * 1000;

function addInterval(date, interval) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + (interval === "year" ? 12 : 1));
  return d;
}

function isBilledRole(role) {
  return Boolean(PLANS[role]);
}





async function createInitialSubscription(userId, role, email, accountCreatedAt) {
  if (!isBilledRole(role)) return null;
  const existing = await Subscription.findOne({ user: userId, role });
  if (existing) return existing;

  const start = accountCreatedAt ? new Date(accountCreatedAt) : new Date();

  if (TRIAL_DAYS > 0) {
    const trialEndsAt = new Date(start.getTime() + TRIAL_DAYS * DAY_MS);
    return Subscription.create({
      user: userId,
      userModel: ROLE_TO_MODEL[role],
      role,
      email,
      planCode: PLANS[role].code,
      status: "trialing",
      trialEndsAt,
      currency: CURRENCY,
      history: [{ event: "trial_started", at: start, periodEnd: trialEndsAt, note: `${TRIAL_DAYS} jours d'essai` }],
    });
  }

  
  return Subscription.create({
    user: userId,
    userModel: ROLE_TO_MODEL[role],
    role,
    email,
    planCode: PLANS[role].code,
    status: "expired",
    currency: CURRENCY,
    history: [{ event: "registered", at: start, note: "Compte créé — abonnement requis" }],
  });
}



async function ensureSubscription(userId, role, email, accountCreatedAt) {
  if (!isBilledRole(role)) return null;
  let sub = await Subscription.findOne({ user: userId, role });
  if (!sub) {
    
    if (!email || !accountCreatedAt) {
      const Model = MODEL_BY_ROLE[role];
      const u = Model ? await Model.findById(userId).select("email createdAt") : null;
      email = email || u?.email;
      accountCreatedAt = accountCreatedAt || u?.createdAt;
    }
    sub = await createInitialSubscription(userId, role, email, accountCreatedAt);
  }
  return sub;
}



function getEffectiveStatus(sub) {
  if (!sub) return { status: "none", allowed: false, daysLeft: 0, periodEnd: null };

  const now = Date.now();

  
  if (sub.status === "active" || (sub.cancelAtPeriodEnd && sub.currentPeriodEnd)) {
    if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() > now) {
      return {
        status: "active",
        allowed: true,
        daysLeft: Math.ceil((new Date(sub.currentPeriodEnd).getTime() - now) / DAY_MS),
        periodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: !!sub.cancelAtPeriodEnd,
      };
    }
    
    return { status: "expired", allowed: false, daysLeft: 0, periodEnd: sub.currentPeriodEnd };
  }

  
  if (sub.status === "trialing") {
    if (sub.trialEndsAt && new Date(sub.trialEndsAt).getTime() > now) {
      return {
        status: "trialing",
        allowed: true,
        daysLeft: Math.ceil((new Date(sub.trialEndsAt).getTime() - now) / DAY_MS),
        periodEnd: sub.trialEndsAt,
      };
    }
    return { status: "expired", allowed: false, daysLeft: 0, periodEnd: sub.trialEndsAt, trialEnded: true };
  }

  
  return { status: sub.status, allowed: false, daysLeft: 0, periodEnd: sub.currentPeriodEnd };
}



async function reconcile(sub) {
  const eff = getEffectiveStatus(sub);
  if (!eff.allowed && sub.status !== "expired" && sub.status !== "canceled" && eff.status === "expired") {
    sub.status = "expired";
    sub.history.push({ event: "expired", periodEnd: eff.periodEnd });
    await sub.save();
  }
  return eff;
}


async function activatePaid(sub, { interval, amount, checkoutId, paymentId }) {
  const now = new Date();
  
  const base =
    sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() > now.getTime()
      ? new Date(sub.currentPeriodEnd)
      : now;
  const periodEnd = addInterval(base, interval);

  sub.status = "active";
  sub.interval = interval;
  sub.amount = amount;
  sub.currency = CURRENCY;
  sub.currentPeriodStart = now;
  sub.currentPeriodEnd = periodEnd;
  sub.cancelAtPeriodEnd = false;
  sub.pendingInterval = null;
  sub.pendingAmount = 0;
  if (checkoutId) sub.chargily.lastCheckoutId = checkoutId;
  if (paymentId) sub.chargily.lastPaymentId = paymentId;
  sub.history.push({ event: "paid", interval, amount, checkoutId, periodEnd });

  await sub.save();
  return sub;
}


function toPublic(sub) {
  const eff = getEffectiveStatus(sub);
  const plan = PLANS[sub.role] || null;
  return {
    role: sub.role,
    planCode: sub.planCode,
    plan: plan
      ? { code: plan.code, name: plan.name, tagline: plan.tagline, monthly: plan.monthly, features: plan.features, currency: CURRENCY }
      : null,
    status: eff.status,
    allowed: eff.allowed,
    daysLeft: eff.daysLeft,
    interval: sub.interval,
    amount: sub.amount,
    currency: sub.currency,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    periodEnd: eff.periodEnd,
  };
}

module.exports = {
  DAY_MS,
  addInterval,
  isBilledRole,
  createInitialSubscription,
  ensureSubscription,
  getEffectiveStatus,
  reconcile,
  activatePaid,
  toPublic,
};
