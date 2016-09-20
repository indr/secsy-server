# secsy-server

## Contributing

```bash
npm run dev
npm test
```

## Deployment

```bash
./pre-deploy.sh
git push heroku
heroku run ENV_SILENT=true node --harmony_proxies ace migration:run --force
```
`
