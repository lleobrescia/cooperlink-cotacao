(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$http'];

  /**
   * @ngdoc main
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.<br>
   * Não há necessidade de criação de mais de um.
   * 
   * @property {object} vm - A named variable for the `this` keyword representing the ViewModel
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($http) {
    var vm = this;
    vm.telefone = '0800 000 000';

    var url = 'http://www.checkauto.com.br/ws20v2/WebService1.asmx/Consultar?strXMLSolicitacao=';
    var requisicao = '<xml><CONSULTA><ACESSO><USUARIO>HomCheckauto</USUARIO><SENHA>12345678</SENHA></ACESSO><VEICULO><CHASSI/><UF/><PLACA>CHK9999</PLACA><RENAVAM/><MOTOR/><CRLV/><UF_CRLV/></VEICULO><DADOSPESSOAIS><TIPOPESSOARESTRICOES/><CPFCNPJRESTRICOES/><DDD1RESTRICOES/><TEL1RESTRICOES/><DDD2RESTRICOES/><TEL2RESTRICOES/></DADOSPESSOAIS><PERMISSOES><CONTRATOID>30100393</CONTRATOID><PACOTEID>5</PACOTEID><OPCIONAIS><Precificador/></OPCIONAIS></PERMISSOES><CONSULTAID/><NRCONTROLECLIENTE/></CONSULTA></xml>';


    Activate();

    ////////////////

    function Activate() {
      // $.get(url + requisicao, function (data) {
      //   var leo = $(data).find('string');
      //   leo = $.parseXML(leo[0].textContent);
      //   console.log(leo);
      // });

    }
  }
})();