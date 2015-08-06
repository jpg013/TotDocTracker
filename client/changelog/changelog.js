var apiPrefix = '/app/api';

angular.module('TotDocTracker.changelog', [])
.directive('changelogItem', function() {
    return {
      restrict: 'E',
      templateUrl: 'changelog-item.html'
    };
})
  .factory('ChangelogService', ['$http', function($http) {
    var _url = apiPrefix + '/changelogs';
    return {
      newChangelog: function(data) {
        return $http({
          url: _url,
          method: "POST",
          data: {'changelog': data}
        })
      }
    }
  }])
