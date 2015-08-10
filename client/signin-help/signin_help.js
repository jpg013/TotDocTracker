angular.module('TotDocTracker.signinHelp', [])
  .controller('signinHelpCtrl', ['$scope', '$http', 'Notifier', '$state', function($scope, $http, Notifier, $state) {
    $scope.error = null;

    $scope.resetPassword = function() {
      $scope.$broadcast('show-errors-check-validity');

      if ($scope.resetPasswordForm.$invalid) { return; }
      var data = {
        email: $scope.email
      };

      $http.post('/signin_help', data)
        .success(function(data, status, headers, config) {
          if (data.success) {
            Notifier.notifySuccess(data.msg);
            $state.go('login');
          } else {
            Notifier.notifyError(data.msg);
          }
        }).
        error(function(data, status, headers, config) {
          Notifier.notifyError("Internal error occurred.");
        });
    };
  }]);
