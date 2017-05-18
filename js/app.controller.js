(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = [];

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
  function MainController() {
    var vm = this;


    Activate();

    ////////////////

    function Activate() {}
  }
})();