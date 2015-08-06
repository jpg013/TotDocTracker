var apiPrefix = '/app/api';

angular.module('TotDocTracker.admin', [])
  .controller('changelogModalCtrl', ['$scope', '$modalInstance', 'ChangelogService', function($scope, $modalInstance, ChangelogService) {
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

    $scope.save = function () {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.adminForm.$invalid) { return; }
      data = {
        title: $scope.title,
        date: $scope.date,
        notes: $scope.notes
      };

      ChangelogService.newChangelog(data)
        .success(function(data, status, headers, config) {
          debugger;
          $modalInstance.close(data);
        })
        .error(function(data, status, headers, config) {
          // Error handling
        });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }])
  .controller('adminCtrl', ['$scope', '$http', '$modal', 'Notifier', function($scope, $http, $modal, Notifier) {
    $scope.openChangelogModal = function() {
      var changelogModalInstance = $modal.open({
        animation: true,
        templateUrl: 'admin-changelog-modal.html',
        controller: 'changelogModalCtrl'
      });

      changelogModalInstance.result.then(function(resp) {
        if (resp.success) {
          Notifier.notifySuccess(resp.msg);
        } else {
          Notifier.notifyError(resp.msg || "There was an error saving your change log.");
        }
      });
    };
  }]);
