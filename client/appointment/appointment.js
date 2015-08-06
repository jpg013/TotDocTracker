var apiPrefix = '/app/api';

angular.module('TotDocTracker.appointment', ['jlareau.pnotify'])
  .controller('appointmentsCtrl', ['$scope', 'AppointmentService', '$location', 'InfiniteScrollList', 'Notifier', function($scope, AppointmentService, $location, InfiniteScrollList, Notifier) {
    $scope.editAppointment = function(appointment) {
      $location.path('app/appointments/edit/'+appointment._id);
    };

    $scope.deleteAppointment = function(appointment) {
      AppointmentService.deleteAppointment(appointment._id).success(function(resp) {
        Notifier.notifySuccess();
        $scope.infiniteScroll.removeItem(appointment._id);
      });
    };
    $scope.infiniteScroll = new InfiniteScrollList({
      url: 'app/api/appointments/list'
    });
  }])
  .controller('appointmentFormCtrl', ['$scope', '$http', '$state', '$stateParams', 'AppointmentService', 'CurrentUser', 'Notifier', 'ImmunizationService', function($scope, $http, $state, $stateParams, AppointmentService, CurrentUser, Notifier, ImmunizationService) {
    var mode = 'new';
    if ($stateParams.appointmentId) {
      $scope.appointmentId = $stateParams.appointmentId;
      mode = 'edit';
    }

    var user = CurrentUser.getUser();
    $scope.kids = user.kids || [];
    $scope.selectedImmunizations = [];

    ImmunizationService.fetchImmunizations().then(function(results) {
      if (results.data.success) {
        $scope.immunizations = results.data.list;
      }
    });

    $scope.onSelectImmunization = function(item) {
      var exists = false;
      _.each($scope.selectedImmunizations, function(immunization) {
       if (immunization._id === item._id) {
         exists = true;
       }
      });
      $scope.immunization = null;
      if (exists) {
        return;
      }
      $scope.selectedImmunizations.push(item);
    };

    if (mode === 'edit') {
      AppointmentService.getDetail($scope.appointmentId).then(function(response) {
        if (response.data.success) {
          $scope.setModel(response.data.appointment)
        }
      });
    }

    $scope.setModel = function(appointment) {
      $scope.date = appointment.date;
      $scope.reason = appointment.reason;
      $scope.location = appointment.location;
      $scope.selectedImmunizations = appointment.immunizations;
      $scope.weight = appointment.weight;
      $scope.height = appointment.height;
      $scope.notes = appointment.notes;
      $scope.kid = appointment.kid;
    };

    $scope.save = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.appointmentForm.$invalid) { return; }

      data = {
        date: $scope.date,
        reason: $scope.reason,
        location: $scope.location,
        immunizations: _.pluck($scope.selectedImmunizations, '_id'),
        weight: $scope.weight,
        height: $scope.height,
        notes: $scope.notes,
        kid: $scope.kid
      };

      AppointmentService.saveAppointment(data, $scope.appointmentId)
        .success(function(data, status, headers, config) {
          if (data.success) {
            Notifier.notifySuccess(data.msg);
            $state.go("app.appointments");
          } else {
            Notifier.notifyError();
          }
        }).
        error(function(data, status, headers, config) {
          // Error handling
        })
    };

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

    }])
    .directive('appointmentlistitem', function() {
        return {
          restrict: 'E',
          templateUrl: 'appointment-list-item.html'
        };
    })
    .service("AppointmentService", ['$http', 'CurrentUser', function($http) {
      return {
        list: function() {
            return $http({method: "GET", url: apiPrefix + "/appointments/list"});
        },
        getDetail: function(id) {
          return $http({method: "GET", url: apiPrefix + "/appointments/" + id});
        },
        deleteAppointment: function(id) {
          return $http({method: "DELETE", url: apiPrefix + "/appointments/" + id});
        },
        saveAppointment: function(data, id) {
          var url = '/appointments';
          if (id) {
            url += '/update/' + id
          } else {
            url += '/new'
          }
          if (id) {
            return $http.put(apiPrefix + url, {appointmentData: data});
          } else {
            return $http.post(apiPrefix + url, {appointmentData: data});
          }
        }
      }
    }]);
