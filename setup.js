require('./server/environment');
var database     = require('./server/database').connect();
var async        = require('async');
var User         = require('./server/models/user');
var Appointment  = require('./server/models/appointment');
var Immunization = require('./server/models/immunization');
var Changelog    = require('./server/models/changelog');
var _            = require('underscore');

var models = [User, Appointment, Immunization];

var immunizations = [
  {
    name: 'DTap',
    description: 'Protects against three diseases: Diphetheria (affects heart, kidneys and nerves), Tetanus (lockjaw), and Pertussis (whooping cough).'
  },
  {
    name: 'Tdap',
    description: 'Protection from the DTaP vaccines can fade over time. To keep immunity strong, adolescents and adults need booster vaccines. Tdap is used as a booster vaccine for adolescents and adults to protect against tetanus, diphtheria, and pertussis. Pertussis can cause death in infants up to 6 months old. For this reason, anyone who has regular contact with an infant younger than 6 months old should get a Tdap booster.'
  },
  {
    name: 'Hepatitis A',
    description: 'Protects against hepatitis A, which can cause severe liver problems.'
  },
  {
    name: 'Hepatitis B',
    description: 'Protects against hepatitis B, which can damage the liver, cause liver cancer, and lead to death.'
  },
  {
    name: 'Hib',
    description: 'Protects from Haemophilus influenzae type b, which causes severe infections of the brain, blood, joints, bones, skin, and throat. It most often affects children younger than 5 years old.'
  },
  {
    name: 'HPV',
    description: 'Protects against diseases caused by the specific genital human papillomaviruses (HPV) contained in the vaccine. These HPV viruses can cause genital warts, anal cancer, and precancers of the cervix, vulva, and vagina.'
  },
  {
    name: 'Influenza',
    description: 'Protect against yearly flu viruses, which spread quickly from person to person. The flu can be very serious, causing high fever, seizures, and diarrhea. It can also lead to more serious illnesses, such as pneumonia, and make chronic health problems worse.'
  },
  {
    name: 'IPV',
    description: 'Protects against polio, a severe crippling disease. About one person in 10 who gets polio will die from it.'
  },
  {
    name: 'MMR',
    description: 'Protects against Measles, Mumps and Rubella.'
  },
  {
    name: 'MCV',
    description: 'Protects against meningitis, which is an infection of the fluid surrounding the brain and spinal cord and causes blood infections.'
  },
  {
    name: 'PCV',
    description: 'Protects against infection from the pneumococcal bacteria, which can cause ear infections, meningitis, blood infections, and pneumonia. Pneumococcal infections can be serious and may lead to death.'
  },
  {
    name: 'Rotavirus',
    description: 'Protects against rotavirus, which causes severe diarrhea in infants and young children. It may also cause fever and vomiting. The vaccine is given in three doses orally (by mouth). The doses are recommended at 2, 4, and 6 months of age. The first dose should be given between 6 and 14 weeks of age. The series should be complete by 8 months of age.'
  },
  {
    name: 'Varicella',
    description: 'Protects against chickenpox, a potentially dangerous illness that can lead to death. If your child has had chickenpox, he or she might already be immune and may not need to be vaccinated. Discuss this with your child\'s doctor.'
  }];

var dropDatabase = function(next) {
  async.eachSeries(models, function (model, callback) {
    model.remove().exec(callback);
  }, function done() {
    next();
  });
};

var setupAdmin = function(next) {
  var user = new User({
    firstName : "Justin",
    lastName  : "Graber",
    email     : "jpg013@gmail.com",
    admin     : true,
    created   : new Date(),
    kids      : []
  });

  user.hashPassword("password", function(err, hash) {
    if (err) {
      console.log(err);
    } else {
      user.password = hash;
      user.save(next);
    }
  });
};

var addImmunizations = function(next) {
  async.eachSeries(immunizations, function(item, cb) {
    var immunization = new Immunization({
      name: item.name,
      description: item.description
    });
    immunization.save(cb);
  }, function(err) {
    next();
  })
};


async.series([
  dropDatabase,
  setupAdmin,
  addImmunizations
], function(err) {
  console.log("Finished");
  process.exit(0);
});

