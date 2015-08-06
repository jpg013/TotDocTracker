var apiPrefix = '/app/api';
angular.module('TotDocTracker.authentication', ['LocalStorageModule'])
    .factory('CurrentUser', ['$http', function($http) {
        var _currentUser = null;
        var _url = apiPrefix + '/users/context';
        return {
            fetch: function() {
                var cb = _.bind(function(response) {
                    if (response.data.success) {
                        this.setUser(response.data.user);
                    }
                }, this);
                return $http({method: "GET", url: _url}).then(cb);
            },
            setUser: function(user) {
                _currentUser = user;
            },
            getUser: function() {
                return _currentUser;
            },
            clearCurrentUser: function() {
                _currentUser = null;
            },
            isAdmin: function() {
              return _currentUser.admin === true;
            }
        };
    }])
    .factory("AuthenticationService", ['$window', 'localStorageService', function($window, localStorageService) {
        var _isLoggedIn = false;
        var _key = "accessToken";
        return {
            isLoggedIn: function() {
                // Fail immediately if flag is false.
                // The case where the flag is false and we have a token should be handled in other places
                if (!_isLoggedIn) {return false;}
                var token = localStorageService.get(_key);
                if (typeof token !== "undefined" && token !== null) {
                    return true;
                } else {
                    return false;
                }
            },
            login: function(data) {
                // Sets the web token in local storage and authenticates the user
                var token = data || localStorageService.get(_key);
                if (typeof token == "undefined" || token == null) { return; }
                localStorageService.set(_key, token);
                $window.sessionStorage.token = token;
                _isLoggedIn = true;
            },
            logout: function() {
                localStorageService.remove(_key);
                delete $window.sessionStorage.token;
                _isLoggedIn = false;
            },
            hasAuthToken: function() {
                var token = localStorageService.get(_key);
                if (typeof token !== "undefined" && token !== null) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }])
    .factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'TotDocTracker ' + $window.sessionStorage.token;
                }
                return config;
            },
            requestError: function(rejection) {
                return $q.reject(rejection);
            },
            response: function (response) {
                if (response != null && response.status == 200 && AuthenticationService.hasAuthToken() && !AuthenticationService.isLoggedIn()) {
                    AuthenticationService.login();
                }
                return response || $q.when(response);
            },
            /* Revoke client authentication if 401 is received */
            responseError: function(rejection) {
                if (rejection != null && rejection.status === 401) {
                    AuthenticationService.logout();
                    $location.path("/login");
                }
                return $q.reject(rejection);
            }
        };
    });