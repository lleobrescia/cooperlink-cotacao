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
        controller: 'PlacaController',
        controllerAs: 'placa',
        templateUrl: 'views/placa.html',
        url: '/'
      })
      .state('fipe', {
        controller: 'SemPlacaController',
        controllerAs: 'placa',
        templateUrl: 'views/fipe.html',
        url: '/placa-nao-encontrada'
      })
      .state('cotacao', {
        controller: 'CotacaoController',
        controllerAs: 'cotacao',
        templateUrl: 'views/cotacao.html',
        url: '/cotacao'
      });
  }
})();