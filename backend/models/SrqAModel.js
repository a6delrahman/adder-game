// Backend: models/SrQaModel.js
const mongoose = require('mongoose');

const srqASchema = new mongoose.Schema({
  responses: {
    mot1: { type: Number, required: true },
    mot2: { type: Number, required: true },
    mot3: { type: Number, required: true },
    mot4: { type: Number, required: true },
    mot5: { type: Number, required: true },
    mot6: { type: Number, required: true },
    mot7: { type: Number, required: true },
    mot8: { type: Number, required: true },
    mot9: { type: Number, required: true },
    mot10: { type: Number, required: true },
    mot11: { type: Number, required: true },
    mot12: { type: Number, required: true },
    mot13: { type: Number, required: true },
    mot14: { type: Number, required: true },
    mot15: { type: Number, required: true },
    mot16: { type: Number, required: true },
    mot17: { type: Number, required: true },
  },
  intrinsic: { type: Number, required: true },
  identified: { type: Number, required: true },
  introjected: { type: Number, required: true },
  external: { type: Number, required: true },
  sdi: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Survey', srqASchema);
