var mongoose = require("mongoose");

// Schema -------------------------------------------------------------
var FeatureRequestSchema = new mongoose.Schema ({
  date          : {type: Date},
  comments      : {type: String},
  userId        : {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
});

// Exports ------------------------------------------------------------
module.exports = mongoose.model('FeatureRequest', FeatureRequestSchema);
