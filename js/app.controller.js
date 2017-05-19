(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$http', 'conversorService'];

  /**
   * @ngdoc main
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.<br>
   * Não há necessidade de criação de mais de um.
   * 
   * @property {object} vm                - A named variable for the `this` keyword representing the ViewModel
   * @property {json} consulta            - Armazena os dados para a consulta ao serviço de consulta de placas
   * @property {string} url               - Armazena o url para a consulta
   * @property {string} vm.placa          - Armazena a placa do usurário que será consultada
   * @property {string} vm.telefone       - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.usuario.data   - Armazena a data/hora da consulta
   * @property {string} vm.usuario.preco  - Armazena a preço da tabela FIPE
   * @property {string} vm.usuario.modelo - Armazena o modelo do carro
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($http, conversorService) {
    var vm = this;
    var consulta = {
      "xml": {
        "CONSULTA": {
          "ACESSO": {
            "USUARIO": null,
            "SENHA": null
          },
          "VEICULO": {
            "CHASSI": null,
            "UF": null,
            "PLACA": null,
            "RENAVAM": null,
            "MOTOR": null,
            "CRLV": null,
            "UF_CRLV": null
          },
          "DADOSPESSOAIS": {
            "TIPOPESSOARESTRICOES": null,
            "CPFCNPJRESTRICOES": null,
            "DDD1RESTRICOES": null,
            "TEL1RESTRICOES": null,
            "DDD2RESTRICOES": null,
            "TEL2RESTRICOES": null
          },
          "PERMISSOES": {
            "CONTRATOID": null,
            "PACOTEID": null,
            "OPCIONAIS": {
              "Precificador": null
            }
          },
          "CONSULTAID": null,
          "NRCONTROLECLIENTE": null
        }
      }
    };
    var url = '';


    vm.placa = '';
    vm.telefone = '0800 000 000';
    vm.usuario = {
      'data': '',
      'modelo': '',
      'preco': ''
    };

    //Atribuicao dos metodos no escopo
    vm.GetDadosRequisicao = GetDadosRequisicao;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof MainController
     */
    function Activate() {

    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os dados para a autorização da consulta, coloca-os no json consulta e depois executa PesquisarPlaca
     * @memberof MainController
     */
    function GetDadosRequisicao() {
      var dados = {};

      /**
       * Pega os dados para fazer a requisição.
       * Eles ficam no PHP para dificultar a visualização de pessoas nao autorizadas.
       */
      $http({
        method: 'GET',
        url: 'php/dados.php'
      }).then(function (resp) {
        dados = resp.data;

        consulta.xml.CONSULTA.ACESSO.USUARIO = dados.usuario;
        consulta.xml.CONSULTA.ACESSO.SENHA = dados.senha;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = dados.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID = dados.pacote;
        url = dados.url;


        PesquisarPlaca();
      });
    }

    /**
     * @function PesquisarPlaca
     * @desc Armazena a plca do usuario no json consulta, converte json para xml, pois o serviço
     * só aceita xml e envia a requisição.
     * @memberof MainController
     */
    function PesquisarPlaca() {
      var xml = '';

      consulta.xml.CONSULTA.VEICULO.PLACA = vm.placa;
      xml = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var codigoConsulta = '';
        var codigoRetornoFipe = '';
        var fipe = ''; //Armazena os dados da tabela fipe
        var retorno = $(data).find('string'); // Recebe a resposta do servico

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml
        codigoConsulta = $(retorno).find('ConsultaID')[0].textContent; //Confirmação que deu tudo ok

        //Se a consulta falhou nao continua
        if (codigoConsulta !== '0001') {
          return;
        }

        vm.usuario.data = $(retorno).find('DataHoraConsulta')[0].textContent; //Armazena a data da consulta

        //Codigo de confirmação de retorno. Se for 1, ha retorno
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;

        //Nao ha dados da tabela fipe
        if (codigoRetornoFipe !== '1') {
          return;
        }

        //Armazena em uma variavel para ficar mais facil a consulta
        fipe = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];

        //Armazena os dados relevantes para dar continuidade a cotação
        vm.usuario.modelo = $(fipe).find('Modelo')[0].textContent;
        vm.usuario.preco = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';
      });
    }
  }
})();