(function () {
  'use strict';

  angular
    .module('app')
    .controller('RespostaPagSeguroController', RespostaPagSeguroController);

  RespostaPagSeguroController.$inject = ['$state', '$http', 'api'];

  function RespostaPagSeguroController($state, $http, api) {
    var vm = this;
    var codigo = {
      'codigo': ''
    };
    var transacao = {
      'cliente': '',
      'criacao': '',
      'descricao': '',
      'pagamento': '',
      'status': '',
      'valor': ''
    };


    Activate();

    ////////////////

    function Activate() {
      codigo.codigo = $state.params.notificationCode || null;

      if (codigo.codigo) {
        $http.post('php/consultTransacao.php').then(function (resp) {
          var retorno = $.parseXML(resp.data);
          transacao.cliente = $(retorno).find('transaction').find('reference')[0].textContent || null;
          transacao.status = $(retorno).find('transaction').find('status')[0].textContent || null;
          transacao.pagamento = $(retorno).find('transaction').find('paymentMethod').find('type')[0].textContent || null;
          transacao.status = $(retorno).find('transaction').find('items').find('item').find('description')[0].textContent || null;
          transacao.valor = $(retorno).find('transaction').find('items').find('item').find('amount')[0].textContent || null;

          $http.post(api + 'transacao/');
        });
      }


    }
  }
})();