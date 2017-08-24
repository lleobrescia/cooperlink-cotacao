(function () {
  'use strict';
  angular
    .module('app')
    .factory('consultCEP', consultCEP);

  consultCEP.$inject = ['$q', '$http'];

  /**
   * @memberof app
   * @ngdoc factory
   * @scope {}
   * @name cep
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @param {service} $q - promise
   * @desc ServiÃ§o de consulta de CEP
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/providers#factory-recipe} Para mais informaÃ§Ãµes
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#factories} Para melhores praticas
   */
  function consultCEP($q, $http) {

    return {
      consultar: Consultar
    };

    /**
     * @function Consultar
     * @desc Consulta o cep fornecido e retorna os dados do local
     * @see {@link http://postmon.com.br/}
     * @param {String} cepToConsult - CEP para consultar
     * @memberof consultCEP
     */
    function Consultar(cepToConsult) {
      var cep = cepToConsult.replace(/\./g, '');
      cep = cep.replace(/\-/g, '');
      var deferred = $q.defer();

      if (cep.length > 7) {
        var call = $.ajax({
          url: 'https://api.postmon.com.br/v1/cep/' + cep
        });

        call.then(function successCallback(response) {
          deferred.resolve(response);
        }, function errorCallback(response) {
          deferred.reject(arguments);
        });

        return deferred.promise;
      } else {
        return '';
      }
    }
  }
}());