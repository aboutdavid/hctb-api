# here comes the bus api

An unoffical API for [Here Comes The Bus](https://herecomesthebus.com/)

## api

POST `/login`
**Querystrings**
- user: Your HCTB email
- pass: Your HCTB password
- code: Your HCTB district code, it's usually a 5 digit code that is used by the district.

Example Response:
```json
{
    "success": true,
    "name": "David",
    "person": "40cc387d-fcdd-49ee-b254-ed54f64dd3bb",
    "time": "17c19592-a9b4-4d6e-ad7b-d861ccd2615d",
    "lat": "33.7488",
    "lon": "-84.3877"
}
```

Self-hosting:
```bash
yarn install
yarn start

# or

npm install
npm start
```