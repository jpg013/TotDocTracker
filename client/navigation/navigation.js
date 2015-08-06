angular.module('TotDocTracker.navigation', [])
    .controller('navCtrl', ['$scope', 'CurrentUser', '$location', 'AuthenticationService', function($scope, CurrentUser, $location, AuthenticationService) {
        var user = CurrentUser.getUser();
        if (user) {
            $scope.firstName = user.firstName;
            $scope.lastName = user.lastName;
        }

        $scope.logout = function() {
            AuthenticationService.logout();
            $location.path("/login");
        }
    }]);