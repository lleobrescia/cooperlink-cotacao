(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$location', '$anchorScroll'];

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
  function MainController($location, $anchorScroll) {
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
    vm.franquia = undefined;
    vm.hasRastreador = false;
    vm.telefone = '0800 000 000';

    //Atribuicao dos metodos no escopo
    vm.Scroll = Scroll;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof MainController
     */
    function Activate() {

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