(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$http', 'conversorService', '$state', 'fipeService', 'toaster', '$location', '$anchorScroll', '$filter', '$rootScope'];

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
   * @property {string} vm.modeloEscolhido - Modelo selecionado (moto ou carro)
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
  function MainController($http, conversorService, $state, fipeService, toaster, $location, $anchorScroll, $filter, $rootScope) {
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

    vm.adesao = undefined;
    vm.anoEscolhido = '';
    vm.carregando = true;
    vm.fipePasso = 'passo1';
    vm.franquia = undefined;
    vm.isUber = false;
    vm.isTaxi = false;
    vm.hasRastreador = false;
    vm.listaAnos = [];
    vm.listaCarros = [];
    vm.listaModelos = [];
    vm.listaMotos = [];
    vm.marcaEscolhida = '';
    vm.modeloEscolhido = '';
    vm.placa = '';
    vm.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    vm.telefone = '0800 000 000';
    vm.usuario = {
      'data': '',
      'modelo': '',
      'preco': ''
    };
    vm.veiculo = '';

    //Atribuicao dos metodos no escopo
    vm.GetAnos = GetAnos;
    vm.GetDadosRequisicao = GetDadosRequisicao;
    vm.GetModelos = GetModelos;
    vm.GetPreco = GetPreco;
    vm.Scroll = Scroll;

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
        vm.carregando = false;
      });
    }

    function GetAnos() {
      vm.carregando = true;
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos').then(function (resp) {
        vm.fipePasso = 'passo4';
        vm.listaAnos = resp;
        vm.carregando = false;
      });
    }

    function GetPreco() {
      vm.carregando = true;
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {

        var yearsApart = new Date(new Date() - new Date(resp.AnoModelo + '-01-01')).getFullYear() - 1970;

        if (yearsApart > 20) {
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não fazemos cotações em veículos com mais de 20 anos.',
            timeout: 50000
          });
        } else {

        }
        vm.carregando = false;
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
        consulta.xml.CONSULTA.ACESSO.SENHA = resp.data.senha;
        consulta.xml.CONSULTA.ACESSO.USUARIO = resp.data.usuario;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      });
    }

    function GetModelos() {
      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos').then(function (resp) {
        vm.listaModelos = resp.modelos;
        vm.fipePasso = 'passo3';
        vm.carregando = false;
      });
    }

    function GetValores() {
      var valores = [];
      var valorFipe = vm.usuario.preco.replace('/R$ ', '');

      $http.get('http://localhost/multiplicar/cotacao/api.php/preco').then(function (resp) {
        valores = php_crud_api_transform(resp.data).preco;
        console.log(valores);

        angular.forEach(valores, function (value, key) {
          if (valorFipe >= value.min && valorFipe <= value.max) {
            switch (value.plano) {
              case 'Bronze':
                vm.preco.bronze = value.valor;
                break;
              case 'Prata':
                vm.preco.prata = value.valor;
                break;
              case 'Ouro':
                vm.preco.ouro = value.valor;
                break;

              default:
                break;
            }
          }
        });

        vm.carregando = false;
        $state.go('cotacao');
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
        var retorno = $(data).find('string'); // Recebe a resposta do servico
        var veiculo = '';

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml
        codigoConsulta = $(retorno).find('ConsultaID')[0].textContent; //Confirmação que deu tudo ok

        console.log(retorno);

        //Se a consulta falhou envia o usuario para a preencher os dados do carro
        if (codigoConsulta !== '0001') {
          $state.go('fipe');
        }

        vm.usuario.data = $(retorno).find('DataHoraConsulta')[0].textContent; //Armazena a data da consulta

        //Codigo de confirmação de retorno. Se for 1, ha retorno
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;
        veiculo = $(retorno).find('RegistroFederal').find('TipoVeiculo')[0].textContent;
        especieVeiculo = $(retorno).find('RegistroFederal').find('EspecieVeiculo')[0].textContent;

        //Verifica se o carro eh taxi
        if (especieVeiculo != 'PASSAGEIRO' && especieVeiculo != 'NAO INFORMADO') {
          vm.carregando = false;
          vm.isTaxi = true;
        }

        //Nao ha dados da tabela fipe. Entao envia o usuario para a preencher os dados do carro
        if (codigoRetornoFipe !== '1') {
          vm.carregando = false;
          $state.go('fipe');
        }

        //Armazena em uma variavel para ficar mais facil a consulta
        fipe = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];

        if ($filter('number')($(fipe).find('Valor')[0].textContent) > 35000) {
          vm.hasRastreador = true;
        }

        //Armazena os dados relevantes para dar continuidade a cotação
        vm.usuario.modelo = $(fipe).find('Modelo')[0].textContent;
        vm.usuario.preco = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';

        GetValores();
      });
    }

    function Scroll(scrollTo) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(scrollTo);

      // call $anchorScroll()
      $anchorScroll();
    }
  }
})();