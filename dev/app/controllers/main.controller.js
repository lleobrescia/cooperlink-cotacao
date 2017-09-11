(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$location', '$anchorScroll', 'projectDir', '$window'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.
   * 
   * @property {object} vm            - A named variable for the `this` keyword representing the ViewModel
   * @property {string} vm.directory  - Caminho do diretorio do sistema
   * @property {string} vm.telefone   - Telefone da multiplicar que aparecerá no html
   * 
   * @param {service}  $location      - Usado para fazer requisições. Semelhante ao ajax
   * @param {service}  $anchorScroll  - Serviço de scroll do angular
   * @param {constant} projectDir     - Local do diretorio do sistema
   * @param {service} $window         - Wrapper for window
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($location, $anchorScroll, projectDir, $window) {
    var vm = this;

    vm.directory = projectDir;
    vm.telefone = '0800 941 5001';

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
      //TODO: Verificar aonde o usuario parou e continuar
      console.log($location.protocol());
      // if ($location.protocol() !== 'https') {
      //   $window.location.href = $location.absUrl().replace('http', 'https');
      // }
    }

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