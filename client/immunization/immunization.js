var apiPrefix = '/app/api';

angular.module('TotDocTracker.immunization', [])
  .factory("ImmunizationService", ['$http', function($http) {
    var _immunizations = [];

    return {
      getImmunizations: function() {
        return _immunizations;
      },
      fetchImmunizations: function(id) {
        return $http({
          url: apiPrefix + "/immunizations",
          method: "GET"
        }).success(function(results) {
          if (results.success) {
            _immunizations = results.list;
          }
        });
      },
      getImmunizationsForKid: function(id) {
        if (typeof id === 'undefined' || id === null) {
          return;
        }
        return $http({
          url: apiPrefix + "/immunizations/kid/"+id,
          method: "GET"
        })
      },
      newImmunization: function(data) {
        return $http({
          url: apiPrefix + "/immunizations",
          method: "POST",
          data: {appointmentData: data}
        })
      }
    }
  }])
  .directive('selectedimmunizationpill', function() {
    return {
      restrict: 'E',
      templateUrl: 'selected-immunization-pill.html',
      link: function(scope, element, attrs) {
        scope.remove = function(item) {
          _.each(scope.selectedImmunizations, function(immunization, index) {
            if (immunization.name === item.name) {
              delete scope.selectedImmunizations[index];
              scope.selectedImmunizations.splice(index,1);
            }
          });
          element.remove();
        }
      }
    };
  });