(function () {
  'use strict';

  //Reference: https://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
  angular
    .module('app')
    .directive('focusMe', focusMe);

  focusMe.$inject = [];

  function focusMe() {

    var directive = {
      link: link,
      scope: {
        trigger: '=focusMe'
      }
    };
    return directive;

    function link(scope, element) {
      scope.$watch('trigger', function (value) {
        if (value === true) {
          element[0].focus();
          scope.trigger = false;
        }
      });
    }
  }
})();