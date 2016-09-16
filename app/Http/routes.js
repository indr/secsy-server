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

  // TODO: Clean up this mess
  Route.get('/users/me', 'UsersController.me')
  Route.delete('/users/me', 'UsersController.deleteAccount')
  Route.patch('/users/me', 'UsersController.updatePreferences')
}).prefix('/api').middleware('auth')

Route.post('/auth/local', 'AuthController.login')
Route.post('/auth/logout', 'AuthController.logout')
Route.post('/api/users', 'UsersController.store')
Route.post('/api/users/confirm', 'UsersController.confirm')
Route.post('/api/users/resend', 'UsersController.resend')
Route.post('/api/users/forgot-password', 'UsersController.forgotPassword')
Route.post('/api/users/reset-password', 'UsersController.resetPassword')

Route.get('/', 'RootController.index')
Route.get('/:lang', 'RootController.lang')

