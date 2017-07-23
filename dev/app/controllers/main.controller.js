(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$location', '$anchorScroll', 'projectDir'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.
   * 
   * @property {object} vm          - A named variable for the `this` keyword representing the ViewModel
   * @property {string} vm.telefone - Telefone da multiplicar que aparecerá no html
   * 
   * @param {service} $location             - Usado para fazer requisições. Semelhante ao ajax
   * @param {service} $anchorScroll  - Converte xml para json e json para xml
   * @param {service} $state            - Usado para troca de views
   * @param {service} fipeService       - Consulta na tabela FIPE
   * @param {constant} projectDir
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($location, $anchorScroll, projectDir) {
    var vm = this;

    vm.directory = projectDir;
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
    function Activate() {}

    /**
     * @function Scroll
     * @desc Faz rolar a pagina para o local idicado
     * @param {string} scrollTo - ID do elemento da tag para a qual a pagina vai
     * @memberof MainController
     */
    function Scroll(scrollTo) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(scrollTo);

      // call $anchorScroll()
      $anchorScroll();
    }
  }
})();