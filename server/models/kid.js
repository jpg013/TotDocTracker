var mongoose =  require('mongoose');

// Schema ----------------------------------------------------------------------
var KidSchema = new mongoose.Schema({
  firstName      : {type: String},
  lastName       : {type: String},
  birthday       : {type: Date},
  gender         : {type: String}
});

// Exports ----------------------------------------------------------------------
module.exports = mongoose.model('Kid', KidSchema);
module.exports.Schema = KidSchema;
