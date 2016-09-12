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

  Route.resources('/keys', 'KeysController')
    .only('index', 'store', 'show')

  Route.resources('/updates', 'UpdatesController')
    .only('index', 'store', 'destroy')

  Route.get('/users/me', 'UsersController.me')
}).prefix('/api').middleware('auth')

Route.post('/auth/local', 'AuthController.login')
Route.post('/auth/logout', 'AuthController.logout')
Route.post('/api/users', 'UsersController.store')
Route.post('/api/users/confirm', 'UsersController.confirm')

Route.get('/', 'RootController.index')
Route.get('/:lang', 'RootController.lang')

