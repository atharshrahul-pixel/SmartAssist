const env = require("../config/env");

let db;
let Specialist;

if (env.dbProvider === 'mongodb') {
  Specialist = require('../models/Specialist');
} else {
  db = require("../config/firebase");
}

const getSpecialists = async ({ category }) => {
  if (env.dbProvider === 'mongodb') {
    const query = category ? { specialization: category } : {};
    const specialists = await Specialist.find(query);
    return specialists.map(s => ({
      id: s._id.toString(),
      name: s.name,
      specialization: s.specialization,
      experience: s.experience,
      availableSlots: s.availableSlots,
      bio: s.bio,
      initials: s.initials,
      rating: s.rating,
      reviews: s.reviews
    }));
  } else {
    let query = db.collection("specialists");
    if (category) {
      query = query.where("specialization", "==", category);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

const createSpecialist = async (data) => {
  if (env.dbProvider === 'mongodb') {
    const specialist = await Specialist.create(data);
    return { id: specialist._id.toString(), ...data };
  } else {
    const docRef = await db.collection("specialists").add(data);
    return { id: docRef.id, ...data };
  }
};

const updateSpecialist = async (id, data) => {
  if (env.dbProvider === 'mongodb') {
    await Specialist.findByIdAndUpdate(id, data);
    return { id, ...data };
  } else {
    await db.collection("specialists").doc(id).update(data);
    return { id, ...data };
  }
};

const deleteSpecialist = async (id) => {
  if (env.dbProvider === 'mongodb') {
    await Specialist.findByIdAndDelete(id);
    return { id };
  } else {
    await db.collection("specialists").doc(id).delete();
    return { id };
  }
};

const getSpecialistById = async (id) => {
  if (env.dbProvider === 'mongodb') {
    const specialist = await Specialist.findById(id);
    return specialist ? { id: specialist._id.toString(), ...specialist.toObject() } : null;
  } else {
    const doc = await db.collection("specialists").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
};

module.exports = {
  getSpecialists,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist
};