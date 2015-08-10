angular.module('TotDocTracker.kids', [])
  .controller('addImmunizationCtrl', ['$scope', '$http', '$modalInstance', '$stateParams', 'ImmunizationService', function($scope, $http, $modalInstance, $stateParams, ImmunizationService) {
    ImmunizationService.fetchImmunizations().then(function(results) {
      if (results.data.success) {
        $scope.immunizationList = results.data.list;
      }
    });

    $scope.kidId = $stateParams.id;

    $scope.today = function() {
      $scope.dt = new Date();
    };

    $scope.clear = function () {
      $scope.dt = null;
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.format = 'shortDate';

    $scope.save = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.immunizationForm.$invalid) { return; }

      var data = {
        name: $scope.immunization.name,
        id: $scope.immunization._id,
        administered: $scope.administered
      };

      $http.post(apiPrefix + '/users/kids/'+$scope.kidId+'/immunization', {immunization: data})
        .success(function(data, status, headers, config) {
          $modalInstance.close(data);
        })
        .error(function(data, status, headers, config) {
          // Error handling
        });
    };

    $scope.closeModal = function() {
      $modalInstance.dismiss('cancel');
    };
  }])
  .controller('kidDetailCtrl', ['$scope', 'CurrentUser', '$stateParams', '$modal', 'Notifier', 'ImmunizationService', function($scope, CurrentUser, $stateParams, $modal, Notifier, ImmunizationService) {
    var user = CurrentUser.getUser();
    $scope.kid = _.find(user.kids, function(kid) {
      return (kid._id.toString() === $stateParams.id);
    });
    $scope.immunizationList = [];

    ImmunizationService.fetchImmunizations().then(function() {

      // API call to get immunizations for kid
      ImmunizationService.getImmunizationsForKid($scope.kid._id)
        .success(function(results) {
          _.each(ImmunizationService.getImmunizations(), function(immunization) {
            var administered;
            for (var i = 0; i < results.list.length; i++) {
              var administeredImmunization = results.list[i];
              if (immunization._id.toString() === administeredImmunization.id.toString()) {
                administered = new Date(administeredImmunization.date).toDateString();
              }
            }
            $scope.immunizationList.push(_.extend(immunization, {administered: administered}));
          });
        });

        /*
        _.each($scope.immunizations, function(immunization) {
          var administered;

          for (var i = 0; i < $scope.kid.immunizations.length; i++) {
            var administeredImmunization = $scope.kid.immunizations[i];
            if (immunization._id.toString() === administeredImmunization.id.toString()) {
              administered = new Date(administeredImmunization.administered).toDateString();
            }
          }
          $scope.immunizationList.push(_.extend(immunization, {administered: administered}));
        });
        */
    });

    $scope.openAddImmunizationModal = function() {
      var addImmunizationModalInstance = $modal.open({
        animation: true,
        templateUrl: 'add-immunization-modal.html',
        controller: 'addImmunizationCtrl',
        backdrop: 'static',
        keyboard: false
      });

      addImmunizationModalInstance.result.then(function(result) {
        if (result) {
          if (result.success) {
            Notifier.notifySuccess();
            // Update current user
            CurrentUser.fetch().then(function() {
              $scope.kid = _.find(CurrentUser.getUser().kids, function(kid) {
                return (kid._id.toString() === $stateParams.id);
              });
            });
          } else {
            Notifier.notifyError(result.msg || "There was an error deleting your kid.");
          }
        }
      });
    };

  }])
  .controller('kidsCtrl', ['$scope', 'CurrentUser', '$http', 'Notifier', '$modal', '$location', function($scope, CurrentUser, $http, Notifier, $modal, $location) {
    var user = CurrentUser.getUser();
    $scope.kids = user.kids || [];

    $scope.openAddKidModal = function() {
      var addKidModalInstance = $modal.open({
        animation: true,
        templateUrl: 'add-kid-modal.html',
        controller: 'addKidCtrl',
        backdrop: 'static',
        keyboard: false
      });

      addKidModalInstance.result.then(function(result) {
        if (result) {
          if (result.success) {
            Notifier.notifySuccess();
            // Update current user
            CurrentUser.fetch().then(function() {
              $scope.kids = CurrentUser.getUser().kids || [];
            });
          } else {
            Notifier.notifyError(result.msg || "There was an error deleting your kid.");
          }
        }
      });
    };

    $scope.view = function(kid) {
      var path = "/app/kid/" + kid._id;
      $location.path(path);
    };

    $scope.deleteKid = function(kid) {
      if (typeof kid === 'undefined' || kid == null) {
        return;
      }
      if (!kid._id) {
        return;
      }
      $http.delete(apiPrefix + '/users/kids/' + kid._id)
        .success(function(resp) {
          if (resp.success) {
            Notifier.notifySuccess();
            CurrentUser.fetch().then(function() {
              $scope.kids = CurrentUser.getUser().kids || [];
            });
          } else {
            Notifier.notifyError(resp.msg || "There was an error deleting your kid.");
          }
        });
    };
  }])
  .directive('kidlistitem', function() {
    return {
      restrict: 'E',
      templateUrl: 'kid-list-item.html'
    };
  })
  .controller('addKidCtrl', ['$scope', '$http', '$modalInstance', function($scope, $http, $modalInstance) {
    $scope.today = function() {
      $scope.dt = new Date();
    };

    $scope.clear = function () {
      $scope.dt = null;
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.format = 'shortDate';

    $scope.saveKid = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.kidForm.$invalid || $scope.genderError) { return; }

      var data = {
        firstName: $scope.firstName,
        lastName: $scope.lastName,
        gender: $scope.gender,
        birthday: $scope.birthday
      };

      $http.post(apiPrefix + '/users/kids', {kid: data})
        .success(function(data, status, headers, config) {
          $modalInstance.close(data);
        })
        .error(function(data, status, headers, config) {
          // Error handling
        });
    };

    $scope.closeModal = function() {
      $modalInstance.close();
    }

  }]);
