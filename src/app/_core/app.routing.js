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
        controller: 'InfoBasicController',
        controllerAs: 'placa',
        templateUrl: 'info-basica/info-basica.html',
        url: '/'
      })
      .state('cotacao', {
        controller: 'CotacaoController',
        controllerAs: 'cotacao',
        templateUrl: 'cotacao/cotacao.html',
        url: '/resultado'
      })
      .state('dados', {
        controller: 'CotacaoController',
        controllerAs: 'dados',
        templateUrl: 'info-avancada/mais.info.html',
        url: '/dados-pessoais'
      })
      .state('contrato', {
        controller: 'ContratoController',
        controllerAs: 'contrato',
        templateUrl: 'contrato/contrato.html',
        url: '/contrato'
      })
      .state('checkout', {
        controller: 'CheckoutController',
        controllerAs: 'checkout',
        templateUrl: 'checkout/checkout.html',
        url: '/checkout'
      });
  }
})();