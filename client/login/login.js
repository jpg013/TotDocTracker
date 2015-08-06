angular.module('TotDocTracker.login', [])
  .controller('loginCtrl', ['$scope', '$http', '$window', '$state', 'AuthenticationService', 'CurrentUser', function($scope, $http, $window, $state, AuthenticationService, CurrentUser) {
    $scope.email = null;
    $scope.password = null;
    $scope.badLogin = false;
    $scope.failedMessage = null;

    $scope.login = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.loginForm.$invalid) { return; }
      $http.post('/login', {email: $scope.email, password: $scope.password})
        .success(function(data, status, headers, config) {
          if (data.success && data.token) {
            $scope.badLogin = false;
            AuthenticationService.login(data.token);
            CurrentUser.fetch().then(function() {
              $state.go("app");
            });
          } else {
            $scope.badLogin = true;
            $scope.failedMessage = data.message;
          }
        })
        .error(function(data, status, headers, config) {
          // To Do
        });
    };

    $scope.logout = function logout() {
      AuthenticationService.logout();
    }
  }]);
