/**
 * Created by jgraber on 7/1/15.
 */
angular.module('TotDocTracker')
  .directive('infoItem', function() {
    return {
      restrict: "E",
      scope: {
        info: '=item'
      },
      templateUrl: 'info-item.html'
    }
  })
  .directive('inputValidation', function() {
    return {
      restrict: "A",
      require: '^form',
      link: function(scope, el, attrs, formCtrl) {
        var inputEl = el[0].querySelector("[name]");
        var inputNgEl = angular.element(inputEl);
        var inputName = inputNgEl.attr('name');
        inputNgEl.bind('blur', function() {
            el.toggleClass('has-error', formCtrl[inputName].$invalid);
        });

        scope.$on('show-errors-check-validity', function() {
          el.toggleClass('has-error', formCtrl[inputName].$invalid);
        });
      }
    }
  })
  .directive('isAdmin', function(CurrentUser) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        if (!CurrentUser.isAdmin()) {
          element.remove();
        }
      }
    }
  })
    .directive('btnRadioValidation', function() {
      return {
        restrict: "A",
        require: '^form',

        link: function(scope, el, attrs, formCtrl) {
          var preEl = el[0].querySelector("pre");
          ngEl = angular.element(preEl);
          scope.$on('show-errors-check-validity', function() {
            if (typeof scope.gender === 'undefined' || scope.gender === null) {
              ngEl.toggleClass('gender-error', true);
              scope.genderError = true;

              scope.$watch('gender', function(value) {
                if (typeof value === 'undefined' || value === null) {
                  return;
                }
                ngEl.toggleClass('gender-error', false);
                scope.genderError = false;
              })
            }
          });
        }
      }
    });
