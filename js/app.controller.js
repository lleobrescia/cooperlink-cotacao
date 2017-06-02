(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$http', 'conversorService', '$state', 'fipeService'];

  /**
   * @ngdoc main
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.<br>
   * Não há necessidade de criação de mais de um.
   * 
   * @property {object} vm                   - A named variable for the `this` keyword representing the ViewModel
   * @property {json}   consulta             - Armazena os dados para a consulta ao serviço de consulta de placas
   * @property {bool}   vm.carregando        - Controla o display do loading
   * @property {json}   vm.listaCarros       - Lista dos modelos de carros da FIPE
   * @property {json}   vm.listaMotos        - Lista dos modelos de motos da FIPE
   * @property {string} vm.marcaEscolhida - Modelo selecionado (moto ou carro)
   * @property {string} vm.placa             - Armazena a placa do usurário que será consultada
   * @property {string} vm.telefone          - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.usuario.data      - Armazena a data/hora da consulta
   * @property {string} vm.usuario.preco     - Armazena a preço da tabela FIPE
   * @property {string} vm.usuario.modelo    - Armazena o modelo do carro
   * 
   * @param {service} $http             - Usado para fazer requisições. Semelhante ao ajax
   * @param {service} conversorService  - Converte xml para json e json para xml
   * @param {service} $state            - Usado para troca de views
   * @param {service} fipeService       - Consulta na tabela FIPE
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($http, conversorService, $state, fipeService) {
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

    vm.automovel = '';
    vm.carregando = false;
    vm.fipePasso = 'passo1';
    vm.listaCarros = [];
    vm.listaModelos = [];
    vm.listaMotos = [];
    vm.listaVeiculos = [];
    vm.marcaEscolhida = '';
    vm.modeloEstolhido = '';
    vm.placa = '';
    vm.telefone = '0800 000 000';
    vm.usuario = {
      'data': '',
      'modelo': '',
      'preco': ''
    };
    vm.veiculoEscolhido = '';

    //Atribuicao dos metodos no escopo
    vm.GetDadosRequisicao = GetDadosRequisicao;
    vm.GetModelos = GetModelos;
    vm.GetVeiculos = GetVeiculos;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof MainController
     */
    function Activate() {
      fipeService.GetMotos().then(function (resp) {
        vm.listaMotos = resp;
      });
      fipeService.GetCarros().then(function (resp) {
        vm.listaCarros = resp;
      });
    }

    function GetModelos() {
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.automovel + '/veiculo/' + vm.marcaEscolhida + '/' + vm.veiculoEscolhido + '.json').then(function (resp) {
        vm.fipePasso = 'passo4';
        vm.listaModelos = resp;
        console.log(resp);
      });
    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os dados para a autorização da consulta, coloca-os no json consulta e depois executa PesquisarPlaca
     * @memberof MainController
     */
    function GetDadosRequisicao() {
      vm.carregando = true;

      /**
       * Pega os dados para fazer a requisição.
       * Eles ficam no PHP para dificultar a visualização de pessoas nao autorizadas.
       */
      $http({
        method: 'GET',
        url: 'php/dados.php'
      }).then(function (resp) {
        consulta.xml.CONSULTA.ACESSO.USUARIO = resp.data.usuario;
        consulta.xml.CONSULTA.ACESSO.SENHA = resp.data.senha;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      });
    }

    function GetVeiculos() {
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.automovel + '/veiculos/' + vm.marcaEscolhida + '.json').then(function (resp) {
        vm.listaVeiculos = resp;
        vm.fipePasso = 'passo3';
        console.log(resp);
      });
    }

    /**
     * @function PesquisarPlaca
     * @desc Armazena a plca do usuario no json consulta, converte json para xml, pois o serviço
     * só aceita xml e envia a requisição.
     * @memberof MainController
     */
    function PesquisarPlaca(url) {
      var xml = '';

      consulta.xml.CONSULTA.VEICULO.PLACA = vm.placa;
      xml = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var codigoConsulta = '';
        var codigoRetornoFipe = '';
        var especieVeiculo = '';
        var fipe = ''; //Armazena os dados da tabela fipe
        var veiculo = '';
        var retorno = $(data).find('string'); // Recebe a resposta do servico

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml
        codigoConsulta = $(retorno).find('ConsultaID')[0].textContent; //Confirmação que deu tudo ok
        console.log(retorno);

        //Se a consulta falhou nao continua
        if (codigoConsulta !== '0001') {
          return;
        }

        vm.usuario.data = $(retorno).find('DataHoraConsulta')[0].textContent; //Armazena a data da consulta

        //Codigo de confirmação de retorno. Se for 1, ha retorno
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;
        veiculo = $(retorno).find('RegistroFederal').find('TipoVeiculo')[0].textContent;
        especieVeiculo = $(retorno).find('RegistroFederal').find('EspecieVeiculo')[0].textContent;
        console.log(veiculo);
        console.log(especieVeiculo);

        //Nao ha dados da tabela fipe
        if (codigoRetornoFipe !== '1') {
          return;
        }

        //Armazena em uma variavel para ficar mais facil a consulta
        fipe = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];

        //Armazena os dados relevantes para dar continuidade a cotação
        vm.usuario.modelo = $(fipe).find('Modelo')[0].textContent;
        vm.usuario.preco = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';

        vm.carregando = false;
        $state.go('cotacao');
      });
    }
  }
})();