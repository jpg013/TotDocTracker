angular.module('TotDocTracker.register', [])
  .controller('registerCtrl', ['$scope', '$http', 'AuthenticationService', '$state', 'CurrentUser', function($scope, $http, AuthenticationService, $state, CurrentUser) {
    $scope.firstName = null;
    $scope.lastName = null;
    $scope.email = null;
    $scope.password = null;

    $scope.register = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.registerForm.$invalid) { return; }
      var data = {
        firstName: $scope.firstName,
        lastName: $scope.lastName,
        email: $scope.email,
        password: $scope.password
      };

      $http.post('/register', data)
        .success(function(data, status, headers, config) {
          if (data.success && data.token) {
            $scope.badRegistration = false;
            AuthenticationService.login(data.token);
            CurrentUser.fetch().then(function() {
              $state.go("app");
            });
          } else {
            $scope.badRegistration = true;
            $scope.failedMessage = data.msg;
          }
        }).
        error(function(data, status, headers, config) {
          // Error handling
        });
    }
    }]);
