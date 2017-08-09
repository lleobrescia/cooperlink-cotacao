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
        templateUrl: 'placa.html',
        url: '/' 
      })
      .state('fipe', {
        controller: 'SemPlacaController',
        controllerAs: 'placa',
        templateUrl: 'fipe.html',
        url: '/placa-nao-encontrada'
      })
      .state('cotacao', {
        controller: 'CotacaoController',
        controllerAs: 'cotacao',
        templateUrl: 'cotacao.html',
        url: '/cotacao'
      })
      .state('dados', {
        controller: 'DadosPessoaisController',
        controllerAs: 'dados',
        templateUrl: 'dadosPessoais.html',
        url: '/dados-pessoais'
      })
      .state('contrato', {
        controller: 'ContratoController',
        controllerAs: 'contrato',
        templateUrl: 'contrato.html',
        url: '/contrato'
      })
      .state('checkout', {
        controller: 'CheckoutController',
        controllerAs: 'checkout',
        templateUrl: 'checkout.html',
        url: '/checkout'
      });
  }
})();