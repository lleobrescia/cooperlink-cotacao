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
    .constant('api', 'ahttp://localhost/multiplicar/cotacao/api.php/')
    .constant('rastreadorCarro', 20000)
    .constant('rastreadorMoto', 7000);
})();