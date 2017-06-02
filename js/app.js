(function () {
  'use strict';

  /**
   * @ngdoc config
   * @scope {}
   * @name app
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Modulo principal da cotação.<br>
   * 
   * @param {module} ngMask     - Mascara para inputs {@link https://github.com/candreoliveira/ngMask}
   * @param {module} ngAnimate  - Animação no angular {@link https://docs.angularjs.org/api/ngAnimate}
   * @param {module} ui.router  - Rotas do Angular(troca de view) {@link https://github.com/angular-ui/ui-router}
   * @param {module} ngMessages - Alertas nos inputs {@link https://docs.angularjs.org/api/ngMessages/directive/ngMessages}
   * @param {module} toastr     - Popup de mensagem {@link https://github.com/Foxandxss/angular-toastr}
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/module} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#startup-logic} Para melhores praticas
   */
  angular.module('app', [
    'ngMask',
    'ngAnimate',
    'ui.router',
    'ngMessages',
    'toastr',
    'angucomplete-alt'
  ]);
})();


(function () {
  'use strict';

  angular
    .module('app')
    .config(RouteConfig);

  RouteConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider'];

  /**
   * @ngdoc config
   * @scope {}
   * @name RouteConfig
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controla as rotas do dashboard.<br>
   * 
   * @param {service} $stateProvider
   * @param {service} $locationProvider
   * @param {service} $urlRouterProvider
   * 
   * @see Veja [Angular DOC]    {@link https://ui-router.github.io/ng1/} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#routing} Para melhores praticas
   */
  function RouteConfig($stateProvider, $locationProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('placa', {
        url: '/',
        templateUrl: 'views/placa.html'
      })
      .state('fipe', {
        url: '/placa-nao-encontrada',
        templateUrl: 'views/fipe.html'
      })
      .state('cotacao', {
        url: '/cotacao',
        templateUrl: 'views/cotacao.html'
      });
  }
})();