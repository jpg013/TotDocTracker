var mongoose           = require("mongoose");
var moment             = require("moment");

// Schema ----------------------------------------------------------------------
var AppointmentSchema = new mongoose.Schema ({
    date          : {type: Date},
    reason        : {type: String},
    location      : {type: String},
    height        : {type: Number},
    weight        : {type: Number},
    userId        : {type: mongoose.Schema.Types.ObjectId},
    createdDate   : {type: Date},
    notes         : {type: String},
    immunizations : [{type: mongoose.Schema.Types.ObjectId, ref: 'Immunization'}],
    kid           : {
      firstName : {type: String},
      lastName  : {type: String},
      id        : {type: mongoose.Schema.Types.ObjectId}
    }
});

// Virtuals
AppointmentSchema.virtual('formattedDate').get(function() {
  return moment.utc(this.date).format("ddd, MMMM D YYYY");
  return this.date.toDateString();
});

// Exports ----------------------------------------------------------------------
module.exports = mongoose.model('Appointment', AppointmentSchema);
