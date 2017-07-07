(function () {
  'use strict';

  /**
   * @ngdoc config
   * @scope {}
   * @name constants
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Constantes do APP.<br>
   */
  angular
    .module('app')
    .constant('api', 'http://localhost/multiplicar/cotacao/api.php/')
    .constant('rastreadorCarro', 20000)
    .constant('rastreadorMoto', 7000)
    .constant('anoCarro', 20)
    .constant('anoMoto', 2005);
})();