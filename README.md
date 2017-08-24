# Sistema de cotação Multiplicar
---
Desenvolvido em AngularJS v.1.6.4

* Autor:   [Basic](http://www.basic.com.br/) <contato@basic.com.br>
* Dono:   [Multiplicar Brasil](https://multiplicarbrasil.com.br/) 
* Contribuidores: 
  * [Leo Brescia](https://leobrescia.com.br/) <leonardo@leobrescia.com.br> 
* Versão: 1.0.5
* Homepage: https://multiplicarbrasil.com.br/cotacao/

  
# Bibliotecas Usadas
---
 
| Plugin | Link | 
| ------ | ------ |
| JQUERY 3.2.1 | [http://jquery.com/](http://jquery.com/) |
| BOOTSTRAP  3.3.7 | [https://getbootstrap.com/docs/3.3/](https://getbootstrap.com/docs/3.3/)|
| ANGULAR 1.6.4| [http://jquery.com/](http://jquery.com/) |
| UI-ROUTER 0.4.2| [https://github.com/angular-ui/ui-router](https://github.com/angular-ui/ui-router) |
| ANGULAR INPUT MASKS 2.6.0|[https://github.com/assisrafael/angular-input-masks](https://github.com/assisrafael/angular-input-masks) |
| PAGSEGURO v2| [https://dev.pagseguro.uol.com.br/](https://dev.pagseguro.uol.com.br/)|

# Desenvolvimento
---
O sistema necessita do [NodeJS](https://nodejs.org/en/) para instalação de dependências. Faça o download e instale.
A pasta `` dis/ `` é a única que vai para o servidor. Ela é gerada com as tarefas do gulp (descritas mais adiante). Todos os outros arquivos são somente para desenvolvimento.
Por causa do PagSeguro, não é possível usar todo o sistema no `` localhost ``. É preciso subir os arquivos para o servidor.

## Gulp
O desenvolvimento é feito com o auxilio do [GULP JS](https://gulpjs.com/). Ele é usado para juntar, minificar e otimizar todos os scripts dentro de `` /src ``

#### Instalação

A instalação global é necessário somente para esse.
No terminal execute o comando:
``` bash
npm install gulp-cli -g
```
#### Plugins
O Gulp utiliza os seguintes plugins: (A instalação deles é feito na seção instalação do desenvolvimento )
| Plugin            | Link                                              | Descrição                                                                     |
| ------            | ------                                            |------                                                                         |
| gulp autoprefixer | https://github.com/sindresorhus/gulp-autoprefixer | Add vendor prefixes to CSS                                                    |
| gulp concat       | https://github.com/contra/gulp-concat             | Concatenates js files                                                         |
| vinyl ftp         | https://github.com/morris/vinyl-ftp               | Blazing fast vinyl adapter for FTP                                            |
| gulp htmlmin      | https://github.com/jonschlinkert/gulp-htmlmin     | Gulp plugin to minify HTML                                                    |
| gulp html replace | https://github.com/VFK/gulp-html-replace          | Replace build blocks in HTML. Like useref but done right                      |
| gulp imagemin     | https://github.com/sindresorhus/gulp-imagemin     | Minify PNG, JPEG, GIF and SVG images                                          |
| gulp ng-annotate  | https://github.com/Kagami/gulp-ng-annotate        | Add angularjs dependency injection annotations                                |
| gulp php minify   | https://github.com/aquafadas-com/gulp-php-minify  | Gulp.js plug-in minifying PHP source code by removing comments and whitespace |
| gulp plumber      | https://github.com/floatdrop/gulp-plumber         | Prevent pipe breaking caused by errors from gulp plugins                      |
| gulp rename       | https://github.com/hparra/gulp-rename             | Provides simple file renaming methods                                         |
| gulp replace      | https://github.com/lazd/gulp-replace              | A string replace plugin for gulp                                              |
| gulp shell        | https://github.com/sun-zheng-an/gulp-shell        | A handy command line interface for gulp                                       |
| gulp uglify       | https://github.com/terinjokes/gulp-uglify         | Minify JavaScript with UglifyJS3                                              |
| gulp util         | https://github.com/gulpjs/gulp-util               | Utility functions for gulp plugins                                            |

#### Tasks
| Tarefa    | Descrição  |
| ------    | ------     |
| css       | Pega o arquivo `` dev/css/style.css `` adiciona prefixos que estão faltando e gera dois arquivos em `` dis/css `` um normal e outro minificado | 
| docs      | Gera documentação do sistema baseado nos comentários dos javascripts |
| html      | Troca o local do local dos arquivos dentro de index.html do local para produção, minifica e envia para `` dis/ `` |
| img       | Otimiza todas as imagens em `` dev/img/ `` e envia para `` dev/img/ `` |
| js        | Concatena todos os scripts dentro de `` dev/app/ `` deixa ele dificil de ser lido e minifica |
| php       | Minifica todos os arquivos php dentro de `` dev/php/ `` retira todas as referencias a pasta de desenvolvimento |
| vendor    | Pega os javascripts dentro de `` dev/js `` concatena e minifica |
| templates | Pega todos os html dentro de `` dev/views `` e junta eles em um arquivo javascript. Isso é feito para otimizar o AngularJS |
| default   | Executa todas as tarefas acima |
| watch     | "Vigia" todos os arquivos do projeto. Caso haja modificação, executa a tarefa correspondente e depois evia para o servidor |

Ecemplo de execução:
```bash
 gulp watch
```
A tarefa watch deverá ser executada antes de iniciar o desenvolvimento do projeto. Um terminal deverá ser aperto na raiz.
Para mais informações, veja o arquivo `` gulpfile.js `` 

## Banco de Dados

O banco de dados utilizado é o MySQL e é utilizado um api para realizar as requisições ao banco. Os detalhes de como utilizar podem ser vistas em : https://github.com/mevdschee/php-crud-api

# Instalação
---
Após baixar o repositório execute o comando no terminal: 
``` bash
npm install
```
Depois da finalização da instalação, execute:
``` bash
gulp
```


