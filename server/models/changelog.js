var mongoose = require("mongoose");
var moment   = require("moment");

// Schema ------------------------------------------------------------
var ChangeLogSchema = new mongoose.Schema ({
  date          : {type: Date},
  title         : {type: String},
  notes         : {type: String}
});


// Virtuals
ChangeLogSchema.virtual('formattedDate').get(function() {
  return moment.utc(this.date).format("ddd, MMMM D YYYY");
  return this.date.toDateString();
});

// Exports ------------------------------------------------------------
module.exports = mongoose.model('Changelog', ChangeLogSchema);
