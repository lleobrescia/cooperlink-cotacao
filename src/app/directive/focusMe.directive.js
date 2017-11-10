(function () {
  'use strict';

  /**
   * @memberof app
   * @ngdoc directive
   * @name focusMe
   *
   * @param {service} $q - promise
   * @desc Faz o cursor fcar no input
   * 
   * @see [Referencia] {@link https://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field}
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/directive} Para mais informacoes
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#directives} Para melhores praticas
   */
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