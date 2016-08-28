'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.group('v1', function () {
  Route.resources('/contacts', 'ContactsController')
    .only('index', 'store', 'show', 'update', 'destroy')
}).prefix('/api/v1')

Route.get('/', 'RootController.index')
Route.get('/:lang', 'RootController.lang')
Route.get('/app/*', 'AppController.index')

