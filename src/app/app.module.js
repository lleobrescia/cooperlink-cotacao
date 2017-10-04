(function () {
  'use strict';

  /**
   * @ngdoc module
   * @scope {}
   * @name app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Modulo principal da cotação.<br>
   * 
   * @param {module} ui.utils.masks     - Mascara para inputs {@link https://github.com/assisrafael/angular-input-masks}
   * @param {module} ngAnimate          - Animação no angular {@link https://docs.angularjs.org/api/ngAnimate}
   * @param {module} ui.router          - Rotas do Angular(troca de view) {@link https://github.com/angular-ui/ui-router}
   * @param {module} ngMessages         - Alertas nos inputs {@link https://docs.angularjs.org/api/ngMessages/directive/ngMessages}
   * @param {module} toaster            - Popup de mensagem {@link https://github.com/jirikavi/AngularJS-Toaster}
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/module} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#startup-logic} Para melhores praticas
   */
  angular.module('app', [
    'ui.utils.masks',
    'ngAnimate',
    'ui.router',
    'ngMessages',
    'toaster',
    'templates',
    'ui.mask'
  ]);
})();

// TODO: Configurar cookie