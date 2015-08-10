var app = angular.module('TotDocTracker',
  [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'LocalStorageModule',
    'infinite-scroll',
    'TotDocTracker.login',
    'TotDocTracker.authentication',
    'TotDocTracker.appointment',
    'TotDocTracker.authentication',
    'TotDocTracker.navigation',
    'TotDocTracker.kids',
    'TotDocTracker.register',
    'TotDocTracker.notifier',
    'TotDocTracker.immunization',
    'TotDocTracker.admin',
    'TotDocTracker.changelog',
    'TotDocTracker.signinHelp',
    'TotDocTracker.passwordRecover'
  ]);

app.controller('featureRequestModalCtrl', ['$scope', '$modalInstance', '$http', function($scope, $modalInstance, $http) {
  $scope.save = function () {
    $scope.$broadcast('show-errors-check-validity');
    if ($scope.requestForm.$invalid) { return; }
    var data = {
      comments: $scope.comments
    };

    $http.post('/app/api/featurerequests', {featureRequest: data})
      .success(function(data, status, headers, config) {
        $modalInstance.close(data);
      })
      .error(function(data, status, headers, config) {
        // Error handling
      });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
app.controller('appCtrl', ['$scope', '$state', 'InfiniteScrollList', '$modal', 'Notifier', 'InfoItems', function($scope, $state, InfiniteScrollList, $modal, Notifier, InfoItems) {
  $scope.infoItems = InfoItems.getInfoItems();
  $scope.state = $state;
  $scope.infiniteScroll = new InfiniteScrollList({
    url: '/app/api/changelogs/list'
  });

  $scope.openFeatureRequestModal = function() {
    var featureRequestModalInstance = $modal.open({
      animation: true,
      templateUrl: 'feature-request-modal.html',
      controller: 'featureRequestModalCtrl'
    });

    featureRequestModalInstance.result.then(function(resp) {
      if (resp.success) {
        Notifier.notifySuccess(resp.msg);
      } else {
        Notifier.notifyError(resp.msg || "There was an error saving your feature request.");
      }
    });
  };

}]);

function resolveUser(CurrentUser) {
  var currentUser = CurrentUser.getUser();
  if (currentUser !== null) {
    return true;
  } else {
    return CurrentUser.fetch();
  }
}

// routes.js
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, localStorageServiceProvider, $locationProvider) {
  // Add our token interceptor to the $httpProvider interceptors
  $httpProvider.interceptors.push('TokenInterceptor');

  $locationProvider.html5Mode(true);

  // Set prefix to avoid overwriting any local storage variables from the rest of your app
  localStorageServiceProvider.setPrefix('TotDocTracker');

  // urlRouterProvider.otherwise doesn't not place nicely with stateChangeStart, this is
  // a work-around solution http://stackoverflow.com/questions/25065699/why-does-angularjs-with-ui-router-keep-firing-the-statechangestart-event
  $urlRouterProvider.otherwise(function($injector) {
      var $state = $injector.get("$state");
      $state.go("app");
  });

  $stateProvider
    .state('app', {
      url: '/app',
      resolve: {
        user: resolveUser
      },
      views: {
        '' : {
          templateUrl: 'app.html',
          controller: 'appCtrl'
        },
        'navigation@app' : {
          templateUrl: 'navigation.html',
          controller: 'navCtrl'
        }
      },
      data: { requireLogin: true }
    })
    .state('app.appointments', {
      url: '/appointments',
      templateUrl: 'appointments.html',
      controller: 'appointmentsCtrl'
    })
    .state('app.edit-appointment', {
      url: '/appointments/edit/:appointmentId',
      templateUrl: 'appointment-form.html',
      controller: 'appointmentFormCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'login.html',
      controller: "loginCtrl"
    })
    .state('register', {
      url: '/register',
      templateUrl: 'register.html',
      controller: "registerCtrl"
    })
    .state('app.new-appointment', {
      url: '/appointments/new',
      templateUrl: 'appointment-form.html',
      controller: 'appointmentFormCtrl'
    })
    .state('app.kids', {
      url: '/kids',
      templateUrl: 'kids.html',
      controller: 'kidsCtrl'
    })
    .state('app.kiddetails', {
      url: '/kid/:id',
      templateUrl: 'kid-detail.html',
      controller: 'kidDetailCtrl'
    })
    .state('signin_help', {
      url: '/signin_help',
      templateUrl: 'signin-help.html',
      controller: 'signinHelpCtrl'
    })
    .state('recover', {
      url: '/recover',
      templateUrl: 'password-recover.html',
      controller: 'passwordRecoverCtrl'
    })
    .state('admin', {
      url: '/admin',
      resolve: {
        user: resolveUser
      },
      views: {
        '' : {
          templateUrl: 'admin.html',
          controller: 'adminCtrl'
        },
        'navigation@admin' : {
          templateUrl: 'navigation.html',
          controller: 'navCtrl'
        }
      },
      data: { requireLogin: true, requireAdmin: true }
    })
});

app.run(['$rootScope', '$state', '$http', '$window', 'AuthenticationService', 'CurrentUser', function ($rootScope, $state, $http, $window, AuthenticationService, CurrentUser) {
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        // If we have a session token then authenticate and allow access to the app.
        if (AuthenticationService.hasAuthToken() && !AuthenticationService.isLoggedIn()) {
            AuthenticationService.login();
        }

        // Force login page if they are not logged in an state is restricted.
        var requireLogin = typeof toState !== "undefined" && toState !== null ? (_ref = toState.data) != null ? _ref.requireLogin : void 0 : void 0;
        if (requireLogin && !AuthenticationService.isLoggedIn()) {
            event.preventDefault();
            $state.go("login");
        }

      // Redirect from login page if they are already logged in.
      if ((toState.name == "login" || toState.name == "register") && AuthenticationService.isLoggedIn()) {
          event.preventDefault();
          $state.go("app");
      }

      // If they are trying to access admin restricted page, redirect
      if ((toState.name == "admin") && !CurrentUser.isAdmin()) {
        event.preventDefault();
        $state.go("app");
      }
    });
}]);
