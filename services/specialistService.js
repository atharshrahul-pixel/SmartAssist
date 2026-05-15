const Specialist = require('../models/Specialist');

const getSpecialists = async ({ category }) => {
  const query = category ? { specialization: category } : {};
  const specialists = await Specialist.find(query).lean();
  return specialists.map(s => ({
    id: s._id.toString(),
    ...s
  }));
};

const createSpecialist = async (data) => {
  const doc = await Specialist.create(data);
  return { id: doc._id.toString(), ...doc.toObject() };
};

const updateSpecialist = async (id, data) => {
  const doc = await Specialist.findByIdAndUpdate(id, data, { new: true });
  return doc ? { id: doc._id.toString(), ...doc.toObject() } : null;
};

const deleteSpecialist = async (id) => {
  await Specialist.findByIdAndDelete(id);
  return { id };
};

const getSpecialistById = async (id) => {
  const doc = await Specialist.findById(id).lean();
  return doc ? { id: doc._id.toString(), ...doc } : null;
};

module.exports = {
  getSpecialists,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist
};
