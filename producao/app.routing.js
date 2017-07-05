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