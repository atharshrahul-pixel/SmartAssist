const env = require("../config/env");
const Specialist = require("../models/Specialist");
const db = require("../config/firebase");

const getSpecialists = async ({ category }) => {
  if (env.dbProvider === 'mongodb') {
    const query = category ? { specialization: category } : {};
    return await Specialist.find(query).lean();
  }

  let query = db.collection("specialists");
  if (category) {
    query = query.where("specialization", "==", category);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const createSpecialist = async (data) => {
  if (env.dbProvider === 'mongodb') {
    const doc = await Specialist.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  const docRef = await db.collection("specialists").add(data);
  return { id: docRef.id, ...data };
};

const updateSpecialist = async (id, data) => {
  if (env.dbProvider === 'mongodb') {
    const doc = await Specialist.findByIdAndUpdate(id, data, { new: true });
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : null;
  }

  await db.collection("specialists").doc(id).update(data);
  return { id, ...data };
};

const deleteSpecialist = async (id) => {
  if (env.dbProvider === 'mongodb') {
    await Specialist.findByIdAndDelete(id);
    return { id };
  }

  await db.collection("specialists").doc(id).delete();
  return { id };
};

const getSpecialistById = async (id) => {
  if (env.dbProvider === 'mongodb') {
    const doc = await Specialist.findById(id).lean();
    return doc ? { id: doc._id.toString(), ...doc } : null;
  }

  const doc = await db.collection("specialists").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

module.exports = {
  getSpecialists,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist
};
