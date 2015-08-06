var mongoose =  require('mongoose');

// Schema ----------------------------------------------------------------------
var ImmunizationSchema = new mongoose.Schema({
  name        : {type: String},
  description : {type: String}
});


// Exports ----------------------------------------------------------------------
module.exports = mongoose.model('Immunization', ImmunizationSchema);
module.exports.Schema = ImmunizationSchema;
