(function () {
  'use strict';

  /**
   * @ngdoc constant
   * @scope {}
   * @name constants
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Constantes do APP.
   */
  angular
    .module('app')
    .constant('api', 'http://localhost/multiplicar/cotacao/api.php/')
    .constant('PagSeguroDirectPayment', PagSeguroDirectPayment)
    .constant('projectDir', 'dist/')
    .constant('projectDev', 'src/')
    .constant('rastreadorCarro', 15000)
    .constant('rastreadorMoto', 7000)
    .constant('anoCarro', 20)
    .constant('anoMoto', 2005)
    .constant('pipedrive','https://cooperlink.pipedrive.com/v1/');
})();