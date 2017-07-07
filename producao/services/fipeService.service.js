(function () {
  'use strict';
  angular
    .module('app')
    .factory('fipeService', fipeService);

  fipeService.$inject = ['$q'];

  /**
   * @memberof app
   * @ngdoc factory
   * @name fipeService
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Serviço de consulta da tabela fipe
   * 
   * @param {service} $q - promise
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/providers#factory-recipe} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#factories} Para melhores praticas
   */
  function fipeService($q) {
    var url = 'https://fipe-parallelum.rhcloud.com/api/v1/';

    return {
      Consultar: Consultar,
      GetCarros: GetCarros,
      GetMotos:  GetMotos
    };

    /**
     * @function Consultar
     * @desc Consulta a tabela fipe
     * @see {@link https://fipeapi.appspot.com/}
     * @param {String} endpoint - final da consulta ao serviço
     * @return {promise} resultado da consulta
     * @memberof fipeService
     */
    function Consultar(endpoint) {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + endpoint
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }

    /**
     * @function GetCarros
     * @desc Busca todos as fabricantes de carros
     * @return {promise} lista de fabricantes de carros
     * @memberof fipeService
     */
    function GetCarros() {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + 'carros/marcas'
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }

    /**
     * @function GetCarros
     * @desc Busca todos as fabricantes de motos
     * @return {promise} lista de fabricantes de motos
     * @memberof fipeService
     */
    function GetMotos() {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + 'motos/marcas'
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }
  }
}());