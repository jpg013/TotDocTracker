angular.module('TotDocTracker.passwordRecover', [])
  .controller('passwordRecoverCtrl', ['$scope', '$http', 'Notifier', '$state', '$location', function($scope, $http, Notifier, $state, $location) {
    $scope.password = null;
    $scope.passwordRepeat = null;
    $scope.samePasswordError = false;

    $scope.submit = function() {
      if ($scope.passwordRecoveryForm.$invalid) { return; }
      if ($scope.password !== $scope.passwordRepeat) {
        $scope.samePasswordError = true;
        return;
      } else {
        $scope.samePasswordError = false;
      }

      var data = {
        pass: $scope.password,
        passRepeat: $scope.passwordRepeat,
        code: $location.search().code
      };

      $http.post('/recover', data)
        .success(function(data, status, headers, config) {
          Notifier.notifySuccess('You password has been changed.');
          $state.go('login');
        })
        .error(function(data, status, headers, config) {
          debugger;
          $scope.passwordRecoveryForm.$setPristine();
          $scope.password = null;
          $scope.passwordRepeat = null;
          Notifier.notifyError('There was an error resetting your password. Please try again later or contact your system administrator.')
        });
    }
  }]);
